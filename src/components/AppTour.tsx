import { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Joyride, { Step } from 'react-joyride';
import { useTheme } from '@mui/material/styles';
import { PATH_DOCS_CLIENT } from 'routes/paths';
import useAppTour from 'hooks/useAppTour';
import { getTourSteps } from 'constants/appTour';
import useAuth from 'hooks/useAuth';

const AppTour = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const isMobile = useMediaQuery('(min-width:600px)');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const getSteps = getTourSteps(currentUser?.role);
    setSteps(getSteps);
  }, [currentUser]);

  const handlerCallback = ({ status, action }: { status: string; action: string }) => {
    if (action === 'close') setOpenAppTour(false);
    if (status === 'finished') setOpenDialog(true);
  };

  const theme = useTheme();

  // Consume useState from app tour context
  const { setOpenAppTour } = useAppTour();

  const handleClick = () => {
    setOpenAppTour(false);
    setOpenDialog(false);
  };

  return (
    <>
      <Joyride
        steps={steps}
        continuous
        showProgress={isMobile}
        disableScrolling
        callback={handlerCallback}
        locale={{ last: 'Finish tour' }}
        styles={{
          options: {
            zIndex: 10001,
          },
          overlay: {
            zIndex: 10000,
          },
          buttonNext: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          buttonBack: {
            color: 'FFF',
          },
        }}
      />

      <Dialog open={openDialog} maxWidth="sm">
        <DialogTitle>Keep Learning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Go to Finpace University to gain even more speed and accuracy with Finpace
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <Button onClick={handleClick} sx={{ textTransform: 'none' }}>
              Start using Finpace now!
            </Button>
            <Button
              href={PATH_DOCS_CLIENT}
              target="_blank"
              rel="noopener"
              variant="contained"
              sx={{ textTransform: 'none' }}
              onClick={handleClick}
            >
              Go to tutorials & documentation
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppTour;
