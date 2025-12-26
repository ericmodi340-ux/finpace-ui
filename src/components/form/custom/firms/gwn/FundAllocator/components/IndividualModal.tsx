import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  styled,
} from '@mui/material';
import IndividualRow from './IndividualRow';
import { FundAllocatorContext } from '../FundAllocator';
import Iconify from 'components/Iconify';
import { v4 as uuidv4 } from 'uuid';
import { IndividualAllocationMap } from '../_@types';
import { initializeRows } from '../_utils';

type Props = {
  openModal: boolean;
  handleClose: () => void;
};

export const GradientButton = styled(Button)(() => ({
  background: 'linear-gradient(12deg, #000007 0%, #00273F 100%)',
  color: 'white',
  fontWeight: 'bold',
  alignSelf: 'end',

  '&:hover': {
    background: 'linear-gradient(12deg, #00273F 0%, #005F84 100%)',
  },
}));

const IndividualModal = ({ openModal, handleClose }: Props) => {
  const { remainingFundsPercent, platformAllocationMap, setPlatformAllocationMap } =
    useContext(FundAllocatorContext);

  const platformValues = Object.values(platformAllocationMap['Individual Fund Allocation']);
  const indivudualTotal = platformValues.reduce((a, b) => a + b.percentage, 0);

  const [rows, setRows] = useState(() => initializeRows(indivudualTotal, platformAllocationMap));

  const totalLeft =
    remainingFundsPercent - (rows.reduce((a, b) => a + b.percentage, 0) - indivudualTotal);

  const handleContinue = () => {
    setPlatformAllocationMap((prev: any) => {
      const output: any = {};
      for (const row of rows) {
        if (row.name && row.percentage) {
          output[row.name] = {
            name: row.name,
            id: row.id,
            percentage: row.percentage,
            type: row.type,
          };
        }
      }
      return {
        ...prev,
        'Individual Fund Allocation': output,
      };
    });
    handleClose();
  };

  const handleRowChange = (rowId: string, newProperties: Partial<IndividualAllocationMap>) => {
    setRows((prevRows) => {
      // Find the row with the matching id
      const rowIndex = prevRows.findIndex((row) => row.rowId === rowId);

      if (rowIndex === -1) return prevRows; // If row wasn't found, return previous state

      // Create a new array with the updated row
      const newRows = [...prevRows];
      newRows[rowIndex] = { ...newRows[rowIndex], ...newProperties };

      return newRows;
    });
  };

  const handleDelete = (rowId: string) => {
    // Remove row from state
    setRows(rows.filter((row) => row.rowId !== rowId));
  };

  const addNewRow = () => {
    const newRow = {
      rowId: uuidv4(),
      id: '',
      percentage: 0,
      name: '',
      type: 'fund',
    };
    setRows((prev) => [...prev, newRow]);
  };

  return (
    <Dialog onClose={handleClose} open={openModal} fullWidth={true} maxWidth={'md'}>
      <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: 24 }}>
        Allocate Funds
      </DialogTitle>
      <DialogContent>
        {rows.map((row) => (
          <IndividualRow
            key={row.rowId}
            row={row}
            handleRowChange={handleRowChange}
            handleDelete={handleDelete}
          />
        ))}
        <GradientButton
          size="large"
          onClick={addNewRow}
          startIcon={<Iconify icon={'eva:plus-fill'} />}
          sx={{ minWidth: '77px', mt: '20px' }}
        >
          Add
        </GradientButton>
      </DialogContent>
      <DialogActions
        sx={{
          paddingTop: '0 !important',
          paddingBottom: '0 !important',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={rows.some((row) => !row.name || !row.percentage)}
            sx={{ mt: '77px', minWidth: '277px' }}
          >
            Continue
          </Button>
          <Typography
            variant="body1"
            color={totalLeft < 0 ? 'error' : 'text.secondary'}
            sx={{ fontStyle: 'italic', py: '30px' }}
          >
            {totalLeft}% remaining
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(IndividualModal);
