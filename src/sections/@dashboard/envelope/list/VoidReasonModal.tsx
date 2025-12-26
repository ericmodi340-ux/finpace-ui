import { useState } from 'react';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Dialog, Container, Typography, Box, Button, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useSelector } from 'redux/store';

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
  onContinue: (voidReason: string) => void;
  onCancel: VoidFunction;
};

export default function VoidReasonModal({ open, onContinue, onCancel }: Props) {
  const theme = useTheme();
  const [voidReason, setVoidReason] = useState('');

  const { isLoading } = useSelector((state) => state.envelopes);

  const handleFinish = async () => {
    if (voidReason) {
      onContinue(voidReason);
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
                  What is the reason for canceling this?
                </Typography>
                <TextField
                  value={voidReason}
                  onChange={(event) => setVoidReason(event.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ width: `calc(100% - ${theme.spacing(3)})` }}
                  data-test="void-reason-modal-input"
                />
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ mt: 1, display: 'block' }}
                >
                  The above message will be emailed to all signers.
                  <br />
                  The document will have a voided watermark.
                </Typography>
              </Box>

              <Box sx={{ pt: 3, display: 'flex' }}>
                <LoadingButton
                  variant="contained"
                  size="large"
                  onClick={handleFinish}
                  loading={isLoading}
                  disabled={!voidReason || isLoading}
                  sx={{ flex: 1 }}
                  data-test="void-reason-modal-continue-button"
                >
                  Confirm cancellation
                </LoadingButton>
              </Box>

              <Box sx={{ pt: 1.5, display: 'flex' }}>
                <Button
                  size="medium"
                  onClick={onCancel}
                  disabled={isLoading}
                  sx={{ mx: 'auto' }}
                  data-test="void-reason-modal-continue-button"
                >
                  Go back
                </Button>
              </Box>
            </Box>
          </RootStyle>
        </Container>
      </RootStyle>
    </Dialog>
  );
}
