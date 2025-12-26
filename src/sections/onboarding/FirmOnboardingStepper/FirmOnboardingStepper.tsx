import { useState } from 'react';
import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import { varBounce } from 'components/animate';
import LogoIcon from 'components/LogoIcon';
// pages
import { Basics, Plan, Integrations, Team, NextSteps } from './pages';
// utils
import { getParams } from 'utils/params';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function FirmOnboardingStepper({ handleClose }: { handleClose: VoidFunction }) {
  const { checkout_cancelled, checkout_success } = getParams();
  const [firmName, setFirmName] = useState('');
  const [activeStep, setActiveStep] = useState(
    (checkout_cancelled || checkout_success) && !!firmName ? 2 : 0
  );

  const queryMatches = useMediaQuery('(max-width:420px)');

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleClose();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const steps = [
    {
      label: 'Welcome',
      heading: 'Welcome to Finpace',
      description:
        'Finpace helps you save time onboarding and managing your clients and advisors, all while staying compliant.',
      buttonText: 'Get Started',
      isWelcome: true,
    },
    {
      label: 'Basics',
      heading: 'Give us the basics',
      description: 'Please tell us more about your firm to get started.',
      content: <Basics onContinue={handleNext} setFirmName={setFirmName} />,
    },
    {
      label: 'Plan',
      heading: 'Start your plan',
      description: "Let us know your firm's needs to activate your account.",
      content: <Plan onContinue={handleNext} />,
    },
    {
      label: 'Integrations',
      heading: 'Connect with your services',
      description: 'Activate the services you use below to make onboarding even faster.',
      content: <Integrations />,
      buttonText: 'Continue',
      allowSkip: true,
    },
    {
      label: 'Team',
      heading: 'Invite your team',
      description:
        'Invite your advisors and additional firm admins below so they can get started using Finpace',
      content: <Team onContinue={handleNext} />,
      allowSkip: true,
    },
    {
      label: 'Next Steps',
      heading: "You're good to go!",
      description:
        'Next, explore your dashboard and create a template to start onboarding clients.',
      content: <NextSteps onContinue={handleNext} />,
    },
  ];

  return (
    <RootStyle>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: '18px' }}>
        {firmName}
      </Typography>
      <Stepper
        sx={queryMatches ? { width: '85vw', margin: 'auto', overflowX: 'scroll' } : {}}
        activeStep={activeStep}
        alternativeLabel
      >
        {steps.map((step, idx) => (
          <Step key={idx}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          flex: 1,
          maxWidth: 480,
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '30px 0',
        }}
      >
        {steps[activeStep].isWelcome && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <LogoIcon branded={false} />
          </Box>
        )}

        <m.div variants={varBounce().in}>
          <Typography
            variant={steps[activeStep].isWelcome ? 'h2' : 'h3'}
            paragraph
            data-test="onboarding-page-heading"
          >
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
              sx={{ flex: 1 }}
              data-test="onboarding-continue-button"
            >
              {steps[activeStep].buttonText}
            </Button>
          </Box>
        )}

        {steps[activeStep].allowSkip && (
          <Button
            color="inherit"
            onClick={handleNext}
            sx={{ mt: 3, alignSelf: 'center', textTransform: 'none' }}
            data-test="onboarding-skip-button"
          >
            I'll do this later
          </Button>
        )}
      </Box>
    </RootStyle>
  );
}
