import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Typography } from '@mui/material';
// redux
import { dispatch, useSelector } from 'redux/store';
import { createStripeCheckout } from 'redux/slices/stripe';
import { setShowBilling, setStripeCheckoutSuccess } from 'redux/slices/firm';
// sections
import { PricingPlanCard } from 'sections/pricing';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// utils
import { getParams } from 'utils/params';
import { hasActivePlan } from 'utils/firm';
// constants
import { pricingPlans } from 'constants/plans';

// ----------------------------------------------------------------------

/*
 * Original plan selection page connected with Stripe (not in use)
 */

export default function PlanSelect({ onContinue }: { onContinue?: VoidFunction }) {
  const theme = useTheme();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();

  // Variables
  const { firm } = useSelector((state) => state.firm);
  const firmHasActivePlan = hasActivePlan(firm);
  const { checkout_success, checkout_cancelled, session_id, ...params } = getParams();

  // States
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [advisorQuantity, setAdvisorQuantity] = useState(1);
  const [viewYearly, setViewYearly] = useState(true);

  // useEffects
  useEffect(() => {
    if (checkout_cancelled) {
      enqueueSnackbar('Checkout cancelled', { variant: 'info' });
    }
  }, [checkout_cancelled, enqueueSnackbar]);

  useEffect(() => {
    if (checkout_success && session_id) {
      enqueueSnackbar('Checkout was successful!', { variant: 'success' });
      dispatch(setShowBilling(false));
      dispatch(setStripeCheckoutSuccess(true));
    }
  }, [checkout_success, session_id, enqueueSnackbar]);

  useEffect(() => {
    if (firmHasActivePlan && onContinue) {
      onContinue();
    }
  }, [firmHasActivePlan, onContinue]);

  // Handlers & utils
  // Function to make stripe request
  const requestStripeCheckout = async ({
    priceId,
    planType,
    paymentFreq,
    quantity = 1,
  }: {
    priceId: string;
    planType: string;
    paymentFreq: string;
    quantity?: number;
  }) => {
    if (!checkoutLoading) {
      try {
        setCheckoutLoading(true);
        const response = await createStripeCheckout({
          customerId: firm?.stripeCustomerId || '',
          planType: planType,
          paymentFreq: paymentFreq,
          priceId,
          quantity,
          successUrlPath: window.location.pathname,
          redirectParams: params,
        });
        setCheckoutLoading(false);
        if (response?.url) {
          enqueueSnackbar('Redirecting to Stripe...', { variant: 'success' });
          window.location.href = response?.url;
        } else {
          enqueueSnackbar('Something went wrong', { variant: 'error' });
        }

        if (isMountedRef.current) {
          setCheckoutLoading(false);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        if (isMountedRef.current) {
          setCheckoutLoading(false);
        }
      }
    }
  };

  const handlePlanSelect = async (priceId: string, planType: string, paymentFreq: string) => {
    requestStripeCheckout({
      priceId: priceId,
      planType: planType,
      paymentFreq: paymentFreq,
      quantity: advisorQuantity,
    });
  };

  return (
    <Box
      sx={{
        width: `calc(100vw - ${theme.spacing(3)} * 2)`,
        position: 'relative',
        mt: 1,
        mb: 1,
      }}
    >
      <Box>
        <Grid container spacing={2} justifyContent="center">
          {pricingPlans.map((card) => (
            <Grid item xs={12} md={6} lg={3} key={card.subscription}>
              <PricingPlanCard
                card={card}
                advisors={advisorQuantity}
                currentPlan={firm?.plan}
                handleSelect={handlePlanSelect}
                actionDisabled={checkoutLoading}
                viewYearly={viewYearly}
                setViewYearly={setViewYearly}
                setAdvisorQuantity={setAdvisorQuantity}
                advisorQuantity={advisorQuantity}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ my: 5 }}>
          <Typography
            variant="caption"
            align="center"
            sx={{ color: 'text.secondary', display: 'block' }}
          >
            * Plus applicable taxes
          </Typography>
          <Typography
            variant="caption"
            align="center"
            sx={{ color: 'text.secondary', display: 'block' }}
          >
            We partner with Stripe to give you the best and most secure payment experience.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
