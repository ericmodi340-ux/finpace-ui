import { useState, useEffect, Dispatch, SetStateAction } from 'react';
// @ts-ignore
import { m } from 'framer-motion';
// @mui
import {
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Container,
  Card,
} from '@mui/material';
// components
import { varBounce } from 'components/animate';
// pages
import { AdvisorSelect, Basics, NextSteps } from './pages';
// @types
import { ClientManager } from '../../../../@types/client';
// hooks
import useAuth from 'hooks/useAuth';
// constants
import { roles, statuses } from 'constants/users';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

export default function NewClientStepper({
  handleClose,
  setClientWasCreated,
  isProspect = false,
}: {
  handleClose: VoidFunction;
  setClientWasCreated: Dispatch<SetStateAction<boolean>>;
  isProspect?: boolean;
}) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const clientType = isProspect ? 'prospect' : 'customer';

  const initialClient = {
    name: '',
    email: '',
    isVerified: false,
    status: statuses.ACTIVE,
    includeSecondInvestor: false,
    isProspect,
  };

  const [activeStep, setActiveStep] = useState(0);
  const [currentClient, setCurrentClient] = useState<ClientManager>(initialClient as ClientManager);

  useEffect(() => {
    if (currentClient.id) {
      setClientWasCreated(true);
    }
  }, [currentClient.id, setClientWasCreated]);

  const handleSetClient = (updateClient: Partial<ClientManager>) => {
    setCurrentClient((currentClient) => ({ ...currentClient, ...updateClient }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleClose();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const steps = [
    ...(user?.role === roles.FIRM_ADMIN
      ? [
          {
            label: 'Advisor',
            heading: `Advisor Selection`,
            description: <>Please select the {clientType}'s advisor below.</>,
            content: <AdvisorSelect onContinue={handleNext} handleSetClient={handleSetClient} />,
            showMultiformButton: true,
          },
        ]
      : []),
    {
      label: 'Basics',
      heading: 'Give us the basics',
      description: (
        <>
          Please enter the {clientType}'s email below,
          <br />
          and we will check for them in any activated integrations.
        </>
      ),
      content: (
        <Basics
          onContinue={handleNext}
          currentClient={currentClient}
          handleSetClient={handleSetClient}
          isProspect={isProspect}
        />
      ),
      showMultiformButton: true,
    },
    {
      label: 'Next Steps',
      heading: "You're all set!",
      description: `Next, add a form for this ${clientType} or create a new ${clientType}.`,
      content: (
        <NextSteps
          clientId={currentClient.id}
          onContinue={handleNext}
          isProspect={Boolean(currentClient?.isProspect)}
        />
      ),
      buttonText: 'Sounds good!',
      showMultiformButton: false,
    },
  ];

  return (
    <Stack height="100%" minHeight="100vh" position="relative">
      <Stack
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          px: 3,
          py: 2,
          position: 'sticky',
          minHeight: 90,
          width: '100%',
          top: 0,
          zIndex: '2',
          display: { xs: 'none', md: 'flex' },
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Stepper sx={{ flex: 0 }} activeStep={activeStep} alternativeLabel>
              {steps.map((step, idx) => (
                <Step
                  key={idx}
                  sx={{
                    maxWidth: '100px',
                    minWidth: '100px',
                  }}
                >
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </Container>
        <Button
          onClick={handleClose}
          sx={{
            color: 'text.disabled',
            typography: 'body2',
            py: 1,
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            px: 2,
            borderRadius: 1,
            m: 1,
          }}
        >
          Cancel
        </Button>
      </Stack>
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            flex: 1,
            maxWidth: activeStep !== 2 ? 650 : 'fit-content',
            margin: 'auto',
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <m.div variants={varBounce().in}>
            <Typography variant="h3" paragraph data-test="new-client-stepper-page-heading">
              {steps[activeStep].heading}
            </Typography>
          </m.div>
          <Typography sx={{ color: 'text.secondary' }}>{steps[activeStep].description}</Typography>

          {steps[activeStep].content}

          {steps[activeStep].buttonText && (
            <Box sx={{ py: 3, display: 'flex' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                sx={{ flex: 1, maxWidth: 400, mx: 'auto' }}
                data-test="new-client-stepper-continue-button"
              >
                {steps[activeStep].buttonText}
              </Button>
            </Box>
          )}

          {steps[activeStep]?.showMultiformButton && (
            <Button
              color="inherit"
              onClick={() => navigate(PATH_DASHBOARD.clients.import)}
              sx={{ mt: 3, alignSelf: 'center', textTransform: 'none' }}
            >
              Need to import customers?
            </Button>
          )}
        </Card>
      </Container>
    </Stack>
  );
}
