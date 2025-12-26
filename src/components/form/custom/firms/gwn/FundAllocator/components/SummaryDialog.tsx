import React from 'react';
import {
  Dialog,
  DialogContent,
  ListItemText,
  OutlinedInput,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import SummaryCard from './SummaryCard';
import { NewOutlinedButton } from '../FundAllocator';
import { GradientButton } from './IndividualModal';
import { LoadingButton } from '@mui/lab';
import Iconify from 'components/Iconify';
import { SummaryAllocation } from '../_@types';

interface SummaryDialogProps {
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  summaryFunds: SummaryAllocation;
  totalAllocated: number;
  handleAddAnother: () => void;
  handleCompleteAllocation: () => void;
  loadingClient: boolean;
}

const SummaryDialog = ({
  summaryOpen,
  setSummaryOpen,
  summaryFunds,
  totalAllocated,
  handleAddAnother,
  handleCompleteAllocation,
  loadingClient,
}: SummaryDialogProps) => (
  <Dialog maxWidth="md" open={summaryOpen} onClose={() => setSummaryOpen(false)}>
    <DialogContent>
      <SummaryCard summary={summaryFunds} />
      <Grid container spacing={2} justifyContent="space-between" sx={{ m: 0, width: '100%' }}>
        {totalAllocated === 0 && (
          <Grid item xs={12} sx={{ paddingRight: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'normal', my: 1, fontSize: '1.5rem' }}>
              No Funds Allocated, Build the Model First
            </Typography>
          </Grid>
        )}
        {totalAllocated !== 0 && (
          <>
            <Grid item xs={12} sx={{ paddingRight: 2 }}>
              <Divider />
            </Grid>
            <Grid item xs={8} sx={{ paddingRight: 2 }}>
              <ListItemText>Total Fund Allocation</ListItemText>
            </Grid>

            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 2 }}>
              <OutlinedInput
                disabled
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  sx: { textAlign: 'center', p: 1 },
                }}
                sx={{ width: '100px', height: '40px' }}
                value={`${totalAllocated} %`}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'flex-end',
                paddingRight: 2,
                mt: '77px',
              }}
            >
              <NewOutlinedButton
                size="large"
                sx={{
                  textTransform: 'none',
                  fontSize: '16px',
                  minWidth: { md: '277px' },
                }}
                onClick={handleAddAnother}
              >
                Make changes
              </NewOutlinedButton>

              {totalAllocated !== 100 ? (
                <GradientButton
                  startIcon={<Iconify icon={'eva:plus-fill'} />}
                  size="large"
                  onClick={handleAddAnother}
                  sx={{
                    textTransform: 'none',
                    fontSize: '16px',
                    minWidth: '100px',
                    mt: { xs: 2, md: 0 },
                    ml: { xs: 0, md: 2 },
                  }}
                >
                  {totalAllocated < 100 ? 'Add' : 'Remove'}
                </GradientButton>
              ) : (
                <LoadingButton
                  variant="contained"
                  size="large"
                  loading={loadingClient}
                  onClick={handleCompleteAllocation}
                  sx={{
                    textTransform: 'none',
                    fontSize: '16px',
                    minWidth: { md: '277px' },
                    mt: { xs: 2, md: 0 },
                    ml: { xs: 0, md: 2 },
                  }}
                >
                  Confirm
                </LoadingButton>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </DialogContent>
  </Dialog>
);

export default React.memo(SummaryDialog);
