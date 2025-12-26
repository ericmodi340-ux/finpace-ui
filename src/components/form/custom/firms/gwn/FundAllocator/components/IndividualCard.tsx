import { useContext, useState } from 'react';
import { Box, Card, SxProps } from '@mui/material';
import Label from 'components/Label';
import IndividualModal from './IndividualModal';
import { FundAllocatorContext } from '../FundAllocator';
import { INDIVIDUAL_FUND_LOGO } from '../_constants';

const labelStyles: SxProps = {
  top: 16,
  right: 16,
  zIndex: 9,
  position: 'absolute',
  textTransform: 'uppercase',
};

export default function IndividualCard() {
  const [openModal, setOpenModal] = useState(false);
  const { platformAllocationMap } = useContext(FundAllocatorContext);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const platformValues = Object.values(platformAllocationMap['Individual Fund Allocation']);
  const hasFunds = platformValues.some((model) => model.percentage !== 0);
  const fundsAllocated = platformValues.reduce((total, { percentage }) => total + percentage, 0);

  return (
    <>
      <Card
        onClick={handleOpenModal}
        sx={{
          cursor: 'pointer',
          transition: '0.2s all',
          '&:hover': { marginTop: '-10px', marginBottom: '10px', transition: '0.2s all' },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            minHeight: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
          {hasFunds && fundsAllocated !== 0 && (
            <Label
              variant="filled"
              color={fundsAllocated < 0 || fundsAllocated > 100 ? 'error' : 'primary'}
              sx={labelStyles}
            >
              {fundsAllocated}%
            </Label>
          )}
          <img src={INDIVIDUAL_FUND_LOGO} alt="Individual Fund" style={{ maxHeight: '150px' }} />
        </Box>
      </Card>

      <IndividualModal openModal={openModal} handleClose={handleCloseModal} />
    </>
  );
}
