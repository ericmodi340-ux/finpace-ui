import { memo, useCallback, useState } from 'react';
// @mui
import {
  Dialog,
  Typography,
  Button,
  TextField,
  DialogContent,
  DialogTitle,
  DialogActions,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onContinue: (cancelReason: string) => void;
  onCancel: VoidFunction;
};

function CancelReasonModal({ open, onContinue, onCancel }: Props) {
  const [cancelReason, setCancelReason] = useState('');

  const { isLoading } = useSelector((state) => state.envelopes);

  const handleFinish = useCallback(async () => {
    if (cancelReason) {
      onContinue(cancelReason);
      onCancel();
    }
  }, [cancelReason, onCancel, onContinue]);

  const onChange = useCallback((event: any) => setCancelReason(event.target.value), []);

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>What is the reason for canceling this?</DialogTitle>
      <DialogContent>
        <Stack mt={2}>
          <TextField value={cancelReason} onChange={onChange} multiline rows={3} fullWidth />

          <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: 'block' }}>
            The above message will be visible to all reviewers. This action is not reversible.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          size="large"
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
          sx={{ mx: 'auto' }}
        >
          Go back
        </Button>
        <LoadingButton
          variant="contained"
          size="large"
          onClick={handleFinish}
          loading={isLoading}
          disabled={!cancelReason || isLoading}
          sx={{ flex: 1 }}
          data-test="cancel-reason-modal-continue-button"
        >
          Confirm cancellation
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default memo(CancelReasonModal);
