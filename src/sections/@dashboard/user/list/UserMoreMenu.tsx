import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// components
import Iconify from 'components/Iconify';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type Props = {
  onDelete?: VoidFunction;
  onResendVerifyEmail?: VoidFunction;
  editLink: string;
  disableDelete?: boolean;
  userType?: string;
  clientId?: string;
};

export default function UserMoreMenu({
  onDelete,
  onResendVerifyEmail,
  editLink,
  disableDelete,
  userType,
  clientId,
}: Props) {
  const ref = useRef(null);
  const isMountedRef = useIsMountedRef();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    if (onDelete) {
      await onDelete();
    }
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  };

  const handleReinvite = async () => {
    setIsOpen(false);
    if (onResendVerifyEmail) {
      onResendVerifyEmail();
    }
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { px: 1, width: 200, color: 'text.secondary' },
        }}
      >
        {userType === 'client' && (
          <MenuItem
            component={RouterLink}
            to={`${PATH_DASHBOARD.forms.new}?clientId=${clientId}`}
            sx={{ borderRadius: 1, typography: 'body2' }}
          >
            <Iconify icon="mdi:file-document-add-outline" sx={{ mr: 2, width: 24, height: 24 }} />
            New Form
          </MenuItem>
        )}

        <MenuItem
          component={RouterLink}
          to={editLink}
          sx={{ borderRadius: 1, typography: 'body2' }}
        >
          <Iconify icon={'mdi:edit-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
          Edit
        </MenuItem>

        {/* {onResendVerifyEmail && (
          <MenuItem onClick={handleReinvite} sx={{ borderRadius: 1, typography: 'body2' }}>
            <Iconify icon={'eva:email-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Resend invite
          </MenuItem>
        )} */}

        {onDelete && (
          <MenuItem
            disabled={disableDelete}
            onClick={handleOpenDeleteConfirm}
            sx={{ borderRadius: 1, typography: 'body2' }}
          >
            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {onDelete && (
        <Dialog open={deleteConfirmOpen} maxWidth="xs">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>This will permanently delete the user.</strong> This user will no longer be
              able to log in or complete any forms.
              <br />
              <br />
              If you'd like to temporarily deactivate the user's account, click "Cancel" below and
              toggle them as Inactive in their profile.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={isLoading}
              onClick={handleCloseDeleteConfirm}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              disabled={isLoading}
              loading={isLoading}
              onClick={handleDelete}
              sx={{ textTransform: 'none' }}
            >
              Yes, delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
