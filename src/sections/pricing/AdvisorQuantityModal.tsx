import { useState, Dispatch, SetStateAction } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Dialog, Container, Typography, Box, Button, TextField } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  setPlanQuantity: Dispatch<SetStateAction<number | undefined>>;
};

export default function AdvisorQuantityModal({ open, setPlanQuantity }: Props) {
  const [quantity, setQuantity] = useState(1);

  const handleFinish = async () => {
    if (quantity) {
      setPlanQuantity(quantity);
    }
  };

  return (
    <Dialog open={open} data-test="advisor-quantity-modal">
      <RootStyle>
        <Container
          sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RootStyle>
            <Box
              sx={{
                flex: 1,
                maxWidth: 480,
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '30px 0',
              }}
            >
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  How many advisors do you have?
                </Typography>
                <TextField
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(!event.target.value ? 0 : parseFloat(event.target.value))
                  }
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    sx: { textAlign: 'center' },
                  }}
                  data-test="advisor-quantity-modal-input"
                />
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ mt: 1, display: 'block' }}
                >
                  We'll start your billing with{' '}
                  <strong>
                    {quantity} {quantity === 1 ? 'advisor' : 'advisors'}
                  </strong>
                  .
                  <br />
                  You can add or remove advisors at any time.
                </Typography>
              </Box>

              <Box sx={{ pt: 3, display: 'flex' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFinish}
                  disabled={!quantity}
                  sx={{ flex: 1 }}
                  data-test="advisor-quantity-modal-continue-button"
                >
                  Continue
                </Button>
              </Box>

              <Box sx={{ pt: 2 }}>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  You will be redirected to Stripe to securely add payment details.
                </Typography>
              </Box>
            </Box>
          </RootStyle>
        </Container>
      </RootStyle>
    </Dialog>
  );
}
