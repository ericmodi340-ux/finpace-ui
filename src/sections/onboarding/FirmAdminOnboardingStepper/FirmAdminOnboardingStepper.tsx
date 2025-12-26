import { useState } from 'react';
import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';
// components
import { varBounce } from 'components/animate';
import LogoIcon from 'components/LogoIcon';
// pages
import { Basics, NextSteps } from './pages';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function FirmAdminOnboardingStepper({ handleClose }: { handleClose: VoidFunction }) {
  const [activeStep, setActiveStep] = useState(0);

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
      description: 'Please tell us more about yourself to get started.',
      content: <Basics onContinue={handleNext} />,
    },
    {
      label: 'Next Steps',
      heading: "You're good to go!",
      description: 'Next, explore your dashboard and create a form to start onboarding clients.',
      content: <NextSteps onContinue={handleNext} />,
    },
  ];

  return (
    <RootStyle>
      <Stepper sx={{ flex: 0 }} activeStep={activeStep} alternativeLabel>
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
      </Box>
    </RootStyle>
  );
}
