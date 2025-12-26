import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';
import { setShowBilling, setStripeCheckoutSuccess } from 'redux/slices/firm';
import { dispatch, useSelector } from 'redux/store';
import { getParams } from 'utils/params';

const StripeCheckoutSuccess = () => {
  const { planType } = getParams();
  const stripCheckoutSuccess = useSelector((state) => state.firm.stripeCheckoutSuccess);

  // When closing set showBilling false
  const closeHandler = () => {
    dispatch(setStripeCheckoutSuccess(false));
    dispatch(setShowBilling(false));
  };

  return (
    <Dialog open={stripCheckoutSuccess} data-test="checkout-success-modal" onClose={closeHandler}>
      <DialogTitle>
        <Typography variant="h3" sx={{ color: 'primary.main' }}>
          Payment success
        </Typography>
      </DialogTitle>
      <Container sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ my: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Stripe checkout success, enjoy your{' '}
            <Typography component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {planType ? planType.toUpperCase() : null}
            </Typography>{' '}
            plan
          </Typography>
        </Box>
      </Container>
      <DialogActions>
        <Button variant="contained" onClick={closeHandler} sx={{ textTransform: 'none' }}>
          Keep using Finpace
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StripeCheckoutSuccess;
