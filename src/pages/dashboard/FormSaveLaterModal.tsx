import { useState } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

type FromSaveLaterModalTypes = {
  onClick?: () => void;
};

export default function FromSaveLaterModal({ onClick }: FromSaveLaterModalTypes) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOnAccept = () => {
    onClick?.();
    setIsOpen(false);
    window.history.back();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <LoadingButton
        type="submit"
        variant="contained"
        color="info"
        size="large"
        loadingIndicator="Loading..."
        sx={{ flex: 1 }}
        onClick={handleOpen}
      >
        Save for later
      </LoadingButton>

      <Dialog open={isOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Saving now will save changes on any steps that have been completed. You will be able to
            continue the form at a later time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            No, go back
          </Button>
          <Button variant="contained" onClick={handleOnAccept} sx={{ textTransform: 'none' }}>
            Yes, save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
