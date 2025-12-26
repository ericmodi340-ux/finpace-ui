import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { AdvisorManager } from '../@types/advisor';
import { ClientManager } from '../@types/client';
import { FirmAdminManager } from '../@types/firmAdmin';
import { UserRole, UserStatus } from '../@types/user';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { deleteAdvisor, updateAdvisor } from 'redux/slices/advisors';
import { deleteClient, updateClient } from 'redux/slices/clients';
import { deleteFirmAdmin, updateFirmAdmin } from 'redux/slices/firmAdmins';
// components
import Iconify from 'components/Iconify';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUserFromStore from 'hooks/useUserFromStore';
// constants
import { roles, statuses } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  [key: string]: any;
  type: UserRole;
  id: string;
  text?: string;
}

export default function DeleteUserButton({ type, id, text = 'Delete', ...other }: Props) {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [inactiveIsLoading, setInactiveIsLoading] = useState(false);
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isUserProfile = pathname.includes(`${type}s/${id}`);

  const user = useUserFromStore(id, type);

  let userIsInactive;
  switch (type) {
    case roles.ADVISOR:
      userIsInactive = (user as AdvisorManager)?.status === statuses.INACTIVE;
      break;
    case roles.CLIENT:
      userIsInactive = (user as ClientManager)?.status === statuses.INACTIVE;
      break;
    case roles.FIRM_ADMIN:
      userIsInactive = (user as FirmAdminManager)?.status === statuses.INACTIVE;
      break;
    default:
      userIsInactive = false;
      break;
  }

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleMakeUserInactive = async () => {
    try {
      setInactiveIsLoading(true);
      switch (type) {
        case roles.ADVISOR:
          await updateAdvisor(id, { status: statuses.INACTIVE as UserStatus.INACTIVE });
          break;
        case roles.CLIENT:
          await updateClient(id, { status: statuses.INACTIVE as UserStatus.INACTIVE });
          break;
        case roles.FIRM_ADMIN:
          await updateFirmAdmin(id, { status: statuses.INACTIVE as UserStatus.INACTIVE });
          break;
        default:
          break;
      }
      enqueueSnackbar('User marked as inactive!', { variant: 'success' });
      if (isUserProfile) {
        navigate(PATH_DASHBOARD[`${type}s`].root);
      }
      if (isMountedRef.current) {
        setInactiveIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setInactiveIsLoading(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteIsLoading(true);
      switch (type) {
        case roles.ADVISOR:
          await deleteAdvisor(id);
          break;
        case roles.CLIENT:
          await deleteClient(id);
          break;
        case roles.FIRM_ADMIN:
          await deleteFirmAdmin(id);
          break;
        default:
          break;
      }
      enqueueSnackbar('User deleted!', { variant: 'success' });
      if (isUserProfile) {
        navigate(PATH_DASHBOARD[`${type}s`].root);
      }
      if (isMountedRef.current) {
        setDeleteIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setDeleteIsLoading(false);
      }
    }
  };

  return (
    <>
      <LoadingButton
        color="error"
        startIcon={<Iconify icon={'eva:trash-2-outline'} />}
        onClick={handleOpenDeleteConfirm}
        {...other}
        sx={{
          textTransform: 'none',
          ...(other.sx || {}),
        }}
      >
        {text}
      </LoadingButton>

      <Dialog open={deleteConfirmOpen} maxWidth="sm">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>This will permanently delete the user and purge them from the system.</strong>{' '}
            This user will no longer be able to log in or complete any forms.
            <br />
            <br />
            If you'd like to temporarily deactivate the user's account, click "Make Inactive" below
            or cancel out of this window and toggle them as Inactive in their profile.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={deleteIsLoading}
            onClick={handleCloseDeleteConfirm}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Tooltip title={userIsInactive ? 'This user is already inactive' : ''}>
            <div>
              <LoadingButton
                color="error"
                variant="outlined"
                disabled={userIsInactive || inactiveIsLoading || deleteIsLoading}
                loading={inactiveIsLoading}
                onClick={handleMakeUserInactive}
                sx={{ textTransform: 'none' }}
              >
                Make user inactive
              </LoadingButton>
            </div>
          </Tooltip>
          <LoadingButton
            color="error"
            variant="contained"
            disabled={inactiveIsLoading || deleteIsLoading}
            loading={deleteIsLoading}
            onClick={handleDeleteUser}
            sx={{ textTransform: 'none' }}
          >
            Permanently delete user
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
