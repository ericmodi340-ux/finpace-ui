import { useEffect, useState } from 'react';
// @mui
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { AdvisorManager } from '../@types/advisor';
import { ClientManager } from '../@types/client';
import { FirmAdminManager } from '../@types/firmAdmin';
import { UserRole } from '../@types/user';
// redux
import { useSelector } from 'redux/store';
// hooks
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
// utils
import { resendInviteEmail } from 'utils/mail';
// constants
import { roles } from 'constants/users';

type Props = {
  currentUser: AdvisorManager | ClientManager | FirmAdminManager | undefined;
  userRole: UserRole.FIRM_ADMIN | UserRole.ADVISOR | UserRole.CLIENT;
};

function ResendInviteButton({ currentUser, userRole }: Props) {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading: advisorIsLoading } = useSelector((state) => state.advisors);
  const { isLoading: clientIsLoading } = useSelector((state) => state.clients);
  const { isLoading: firmAdminIsLoading } = useSelector((state) => state.firmAdmins);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let newIsLoading = false;
    switch (userRole) {
      case roles.ADVISOR:
        newIsLoading = advisorIsLoading;
        break;
      case roles.CLIENT:
        newIsLoading = clientIsLoading;
        break;
      case roles.FIRM_ADMIN:
        newIsLoading = firmAdminIsLoading;
        break;
      default:
        newIsLoading = false;
        break;
    }

    setIsLoading(newIsLoading);
  }, [advisorIsLoading, clientIsLoading, firmAdminIsLoading, userRole]);

  const handleOnClick = () => resendInviteEmail(currentUser?.id ?? '', userRole, enqueueSnackbar);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '1rem 0',
      }}
      onClick={handleOnClick}
    >
      {user?.sub !== currentUser?.id && (
        <LoadingButton variant="contained" size="medium" loading={isLoading} disabled={isLoading}>
          Resend Invite
        </LoadingButton>
      )}
    </Box>
  );
}

export default ResendInviteButton;
