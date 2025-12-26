import { useState, useEffect } from 'react';
// @ts-ignore
import { m } from 'framer-motion';
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
import CmsSelect from './pages/CmsSelect';
// pages
import { AdvisorSelect, NextSteps } from './pages';
// hooks
import useAuth from 'hooks/useAuth';
// constants
import { roles } from 'constants/users';
import { PATH_DASHBOARD } from 'routes/paths';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

const initialOptions = {
  client: null,
  advisorId: '',
  integrationClient: null,
};

// ----------------------------------------------------------------------

export default function ImportClientStepper({
  handleClose,
  isProspect = false,
}: {
  handleClose: VoidFunction;
  isProspect?: boolean;
}) {
  const { user } = useAuth();
  const clientType = isProspect ? 'prospect' : 'client';
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [currentOptions, setCurrentOptions] = useState(initialOptions);

  const handleSetOption = (updatedOption: any) => {
    setCurrentOptions((currentOption) => ({ ...currentOption, ...updatedOption }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleClose();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  useEffect(() => {
    if (user?.role === roles.ADVISOR) {
      handleSetOption({ advisorId: user?.id });
    }
  }, [user]);

  const steps = [
    ...(user?.role === roles.FIRM_ADMIN
      ? [
          {
            label: 'Advisor',
            heading: `Advisor Selection`,
            description: <>Please select the {clientType}'s advisor below.</>,
            content: <AdvisorSelect onContinue={handleNext} handleSetOption={handleSetOption} />,
            addSingleClient: true,
          },
        ]
      : []),
    {
      label: 'CRM',
      heading: `CRM Import`,
      description: <>Please select the CRM below.</>,
      content: (
        <CmsSelect
          currentOptions={currentOptions}
          onContinue={handleNext}
          handleSetOption={handleSetOption}
          isProspect={isProspect}
        />
      ),
      addSingleClient: false,
    },
    {
      label: 'Next Steps',
      // @ts-ignore
      heading: currentOptions?.automation
        ? 'Job Started'
        : // @ts-ignore
          currentOptions?.client?.alreadyExist
          ? 'Client Already Exists'
          : "You're all set!",
      // @ts-ignore
      description: currentOptions?.automation
        ? ''
        : // @ts-ignore
          currentOptions?.client?.alreadyExist
          ? 'The client is already in our records; please proceed to fill the data from the integration onto the client page.'
          : `Next, add a form for this ${clientType} or create a new ${clientType}.`,
      content: (
        <NextSteps
          client={currentOptions.client}
          currentOptions={currentOptions}
          onContinue={handleNext}
          isProspect={Boolean(isProspect)}
        />
      ),
      buttonText: 'Sounds good!',
      addSingleClient: false,
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

          {steps[activeStep]?.addSingleClient && (
            <Button
              color="inherit"
              onClick={() => navigate(PATH_DASHBOARD.clients.new)}
              sx={{ mt: 3, alignSelf: 'center', textTransform: 'none' }}
            >
              Need to create customer?
            </Button>
          )}
        </Card>
      </Container>
    </Stack>
  );
}
