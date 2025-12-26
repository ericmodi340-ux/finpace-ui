import { TutorialDialog } from './TutorialDialog';
import { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
//hooks
import useUser from 'hooks/useUser';
import useUserFromStore from 'hooks/useUserFromStore';
//@mui
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  styled,
  StepIconProps,
  StepConnector,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
//redux
import { useSelector } from 'redux/store';
import { createTemplate } from 'redux/slices/templates';
import { updateAdvisor } from 'redux/slices/advisor';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';

//utils
import arrayFromObj from 'utils/arrayFromObj';
import { mapPages } from 'utils/templates';
//types
import { ClientManager } from '../../@types/client';
import { FirmAdminManager } from '../../@types/firmAdmin';
import { AdvisorManager } from '../../@types/advisor';
//components
import Iconify from 'components/Iconify';
//constants
import { initialFormFields } from 'constants/templates';
import { support } from 'constants/bitsy';
import { roles } from 'constants/users';
import useResponsive from 'hooks/useResponsive';
import { IntegrationConfig } from '../../@types/integration';

type StepsType = {
  step: string;
  link?: string | undefined;
};

export default function FirstStepsStepper() {
  //hooks
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // templates
  const templatesList = useSelector((state) => state.templates);
  // integrations
  const { integrations } = useSelector((state) => state.integrationsFirm);
  const filteredIntegrations = integrations.filter(
    (item: IntegrationConfig) => item.id !== 'docusign'
  );
  // clients and prospects
  const clients = useSelector((state) => state.clients);
  const clientsArray = arrayFromObj(clients.byId, clients.allIds) as ClientManager[];
  let clientList = clientsArray;
  // current user
  const { user, authUser } = useUser();
  const currentUser = useUserFromStore(user?.id, authUser?.role) as
    | FirmAdminManager
    | AdvisorManager;
  // steps
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(true);
  const isTutorialFinished = currentUser?.settings?.gettingStarted?.tutorialFinished;
  const isDesktop = useResponsive('up', 'sm');

  let STEPS: StepsType[] = [
    { step: 'SignUp tour' },
    { step: 'Create your first client', link: PATH_DASHBOARD.clients.new },
    { step: 'Create your first template' },
    { step: 'Connect your CRM', link: PATH_DASHBOARD.general.integrations },
    { step: 'Finpace support video' },
  ];
  if (authUser?.role === roles.ADVISOR) {
    STEPS = STEPS.filter((item, index) => index !== 2);
  }

  //check steps
  const checkSteps = useCallback(() => {
    const stepsOrder: { [key: number]: boolean } =
      authUser?.role === roles.ADVISOR
        ? {
            0: true,
            1: clientList.length > 0,
            2: filteredIntegrations.length !== 0,
            3: !!currentUser?.settings?.gettingStarted?.supportVideoWatched,
          }
        : {
            0: true,
            1: clientList.length > 0,
            2: templatesList.allIds.length !== 0,
            3: filteredIntegrations.length !== 0,
            4: !!currentUser?.settings?.gettingStarted?.supportVideoWatched,
          };

    Object.keys(stepsOrder).forEach((index) => {
      if (stepsOrder[+index]) {
        completed[+index] = true;
      }
    });
  }, [
    authUser?.role,
    clientList.length,
    completed,
    currentUser?.settings?.gettingStarted?.supportVideoWatched,
    filteredIntegrations.length,
    templatesList.allIds.length,
  ]);

  useEffect(() => {
    checkSteps();
  }, [
    checkSteps,
    clientList.length,
    completed,
    currentUser?.settings?.gettingStarted?.supportVideoWatched,
    filteredIntegrations.length,
    templatesList.allIds.length,
  ]);

  const completedSteps = Object.keys(completed).length;
  const totalSteps = STEPS.length;
  const allStepsCompleted = completedSteps >= totalSteps;

  //----

  const handleStep = (step: string, index: number) => async () => {
    setActiveStep(index);

    if (step === 'Finpace support video') {
      const newCompleted = completed;
      if (authUser?.role === roles.ADVISOR) {
        newCompleted[3] = true;
      } else {
        newCompleted[4] = true;
      }

      setCompleted(newCompleted);
      window.open(support.VIDEO, '_blank');
      const body = {
        settings: {
          ...currentUser?.settings,
          gettingStarted: {
            ...currentUser?.settings?.gettingStarted,
            supportVideoWatched: true,
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
    if (step === 'Create your first template') {
      createNewTemplate();
    }
  };
  //Customized icons
  const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 40,
    height: 40,
    fontSize: 23,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
      backgroundColor: theme.palette.primary.main,
      boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
      backgroundColor: theme.palette.primary.main,
    }),
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    if (authUser?.role === roles.ADVISOR) {
    }
    const icons: { [index: string]: React.ReactElement } =
      authUser?.role !== roles.ADVISOR
        ? {
            1: <Iconify icon={'ic:baseline-tour'} />,
            2: <Iconify icon={'bxs:user'} />,
            3: <Iconify icon={'akar-icons:file'} />,
            4: <Iconify icon={'ant-design:bank-filled'} />,
            5: <Iconify icon={'akar-icons:video'} />,
          }
        : {
            1: <Iconify icon={'ic:baseline-tour'} />,
            2: <Iconify icon={'bxs:user'} />,
            3: <Iconify icon={'ant-design:bank-filled'} />,
            4: <Iconify icon={'akar-icons:video'} />,
          };
    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }
  //-----
  async function createNewTemplate() {
    if (authUser?.role === roles.FIRM_ADMIN) {
      const response = await createTemplate({
        title: 'Untitled ' + new Date().toUTCString(),
        dsFieldMapping: {},
        includeDisclosures: true,
        sendDisclosuresWhen: 'with-contract',
        includedFirmDisclosures: [],
        showDisclosuresPage: true,
        useForOutreachDate: false,
        useForOnboardingDate: false,
        fields: [...mapPages(initialFormFields)],
      });
      if (response?.id) {
        navigate(`${PATH_DASHBOARD.templates.root}/${response.id}`);
      } else {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
      }
    }
  }
  return (
    <>
      <Box sx={{ py: 4, overflow: !isDesktop ? 'scroll' : '' }}>
        <Stepper
          nonLinear
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepConnector-line': {
              marginTop: '8px',
              borderTopWidth: '4px',
            },
          }}
          connector={
            <StepConnector
              sx={{
                zIndex: -9,
                overflow: 'hidden',
                top: '31px',
                height: '4px',
                width: '100%',
                mt: '1px',
                backgroundColor: `${allStepsCompleted ? 'primary.main' : ''}`,
                '& .MuiStepConnector-line': {
                  marginTop: '1px',
                },
              }}
            />
          }
        >
          {STEPS.map((item, index) => (
            <Step
              key={item.step}
              completed={completed[index]}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Button
                onClick={handleStep(item.step, index)}
                disabled={item.step === 'Finpace support video' ? false : completed[index]}
                component={RouterLink}
                to={item.link ? item.link : ''}
              >
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  sx={{
                    p: 1,
                    '&:hover': {
                      transform: `scale3d(1.05,1.05, 1)`,
                      transition: 'all 0.4s',
                    },
                  }}
                >
                  {item.step}
                </StepLabel>
              </Button>
            </Step>
          ))}
        </Stepper>
      </Box>
      {allStepsCompleted && !isTutorialFinished && <TutorialDialog open={open} setOpen={setOpen} />}
    </>
  );
}
