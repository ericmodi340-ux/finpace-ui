import { useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Box, Typography, Card, Stack, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { getStripeCustomerPortal } from 'redux/slices/stripe';
// hooks
import { useSelector } from 'redux/store';

export default function FirmBilling() {
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);

  // States
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = async () => {
    try {
      setLoading(true);
      const response = await getStripeCustomerPortal({
        customerId: firm?.stripeCustomerId || '',
        returnUrl: window.location.href,
      });
      if (response?.url) {
        enqueueSnackbar('Redirecting to Stripe...', { variant: 'success' });
        setLoading(false);
        window.open(response?.url);
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        setLoading(false);
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <Card sx={{ m: 1, p: 3 }}>
          <Stack spacing={3} alignItems="flex-end" direction="row">
            <Stack spacing={2} sx={{ width: 1 }}>
              <Box>
                <LoadingButton
                  variant="outlined"
                  loading={loading}
                  onClick={handleOpenPortal}
                  sx={{ textTransform: 'none' }}
                >
                  Open Billing Portal
                </LoadingButton>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  You will be redirected to Stripe to securely add payment details.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
