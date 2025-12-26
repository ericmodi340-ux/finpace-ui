import * as React from 'react';
//@mui
import { Button, Card, Typography } from '@mui/material';
// @types
import { FirmAdminManager } from '../../@types/firmAdmin';
import { AdvisorManager } from '../../@types/advisor';
// hooks
import useUser from 'hooks/useUser';
// redux
import { updateAdvisor } from 'redux/slices/advisor';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
// sections
import { roles } from 'constants/users';
import useUserFromStore from 'hooks/useUserFromStore';

import OnboardingChecklist from './OnboardingChecklist';
import SvgIconStyle from 'components/SvgIconStyle';
import useSettings from 'hooks/useSettings';
//utils

export default function GettingStarted() {
  const { user, authUser } = useUser();
  const currentUser = useUserFromStore(user?.id, authUser?.role) as
    | FirmAdminManager
    | AdvisorManager;

  const { themeMode } = useSettings();

  const [showList, setShowList] = React.useState(false);

  async function closeStep() {
    const body = {
      settings: {
        ...currentUser?.settings,
        gettingStarted: {
          ...currentUser?.settings?.gettingStarted,
          hidden: true,
        },
      },
    };
    if (user && authUser?.role === roles.ADVISOR) {
      await updateAdvisor(user.id, body);
    }
    if (user && authUser?.role === roles.FIRM_ADMIN) {
      await updateFirmAdmin(user.id, body);
    }
  }

  return (
    <Card
      sx={{
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SvgIconStyle
        src={
          themeMode === 'light'
            ? `/icons/getting-started.svg`
            : `/icons/getting-started-dark-mode.svg`
        }
        sx={{ height: 80, width: 80 }}
      />
      <Typography mt={2} textAlign="center" variant="h5">
        Your account setup is almost complete!
      </Typography>
      <Typography
        sx={{
          maxWidth: 500,
        }}
        mt={1}
        textAlign="center"
        variant="body2"
      >
        In order to complete your account setup and receive your overview, please complete the
        onboarding
      </Typography>
      <Button
        sx={{
          mt: 3,
        }}
        variant="contained"
        onClick={() => setShowList(true)}
      >
        Complete Onboarding
      </Button>
      <Button sx={{ mt: 1 }} onClick={closeStep} variant="text">
        Skip Onboarding
      </Button>
      <OnboardingChecklist
        open={showList}
        onClose={() => setShowList(false)}
        onComplete={closeStep}
      />
    </Card>
  );
}
