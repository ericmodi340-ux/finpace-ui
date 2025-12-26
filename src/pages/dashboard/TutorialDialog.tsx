import React from 'react';
//components
import Iconify from 'components/Iconify';
//mui
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
//utils
import { firstWord } from 'utils/strings';
//types
import { FirmAdminManager } from '../../@types/firmAdmin';
import { AdvisorManager } from '../../@types/advisor';
//redux
import { updateAdvisor } from 'redux/slices/advisor';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
import { roles } from 'constants/users';
import useUser from 'hooks/useUser';
import useUserFromStore from 'hooks/useUserFromStore';

type TutorialDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export function TutorialDialog({ setOpen, open }: TutorialDialogProps) {
  const { user, authUser } = useUser();
  const currentUser = useUserFromStore(user?.id, authUser?.role) as
    | FirmAdminManager
    | AdvisorManager;
  const handleFinishTutorial = () => {
    sendFinishedTutorial();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);

  async function sendFinishedTutorial() {
    const body = {
      settings: {
        ...currentUser?.settings,
        gettingStarted: {
          ...currentUser?.settings?.gettingStarted,
          tutorialFinished: true,
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
    <Dialog onClose={handleClose} open={open} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          textAlign: 'center',
          p: '25px',
        }}
      >
        {`Awesome job, ${
          user ? firstWord(user?.name || '') : 'friend'
        }! You're now ready to use Finpace. Enjoy!`}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Iconify
          icon="fluent-mdl2:completed-solid"
          sx={{
            minHeight: '11vh',
            minWidth: '11vh',
            mx: 'auto',
            mb: '30px',
            color: 'primary.main',
            display: 'flex',
            justifyContent: 'center',
          }}
        />
        <Button
          color="primary"
          variant="contained"
          sx={{
            width: '50%',
            mx: 'auto',
          }}
          onClick={handleFinishTutorial}
        >
          Let's go!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
