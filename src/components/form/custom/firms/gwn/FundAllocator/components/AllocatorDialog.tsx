import { Container, DialogTitle, Box, Typography, Button, Dialog } from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import { PlatformAllocationMap } from '../_@types';
import PlatformList from './PlatformList';
import Iconify from 'components/Iconify';
import { FundAllocatorContext } from '../FundAllocator';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  flex: 1,
  height: '100%',
}));

// ----------------------------------------------------------------------

interface AllocatorDialogProps {
  open: boolean;
  handleClose: () => void;
  platformAllocationMap: PlatformAllocationMap;
  setPlatformAllocationMap: React.Dispatch<React.SetStateAction<PlatformAllocationMap>>;
  totalAllocated: number;
  formId: string | undefined;
}

const AllocatorDialog = ({
  open,
  handleClose,
  platformAllocationMap,
  setPlatformAllocationMap,
  totalAllocated,
  formId,
}: AllocatorDialogProps) => (
  <Dialog maxWidth="xl" open={open} onClose={handleClose} data-test="gwn-fund-allocator-modal">
    <RootStyle>
      <Container maxWidth="xl" sx={{ flex: 1 }}>
        <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Model Allocation - {totalAllocated}% allocated
        </DialogTitle>
        <RootStyle>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ textAlign: 'center', marginBottom: '30px !important', fontStyle: 'italic' }}
            >
              Build your client portfolio below
            </Typography>
            <FundAllocatorContext.Provider
              value={{
                platformAllocationMap,
                setPlatformAllocationMap,
                remainingFundsPercent: 100 - totalAllocated,
                formId,
              }}
            >
              <PlatformList />
            </FundAllocatorContext.Provider>
            <Box
              sx={{
                flex: 1,
                margin: 'auto',
                textAlign: 'center',
                padding: '30px 0',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'normal', my: 1 }}>
                Total Funds Allocated in Models:{' '}
                <span style={{ fontWeight: 'bold' }}>{totalAllocated}%</span>
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleClose}
                  endIcon={<Iconify icon={''} />}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          </Box>
        </RootStyle>
      </Container>
    </RootStyle>
  </Dialog>
);

export default React.memo(AllocatorDialog);
