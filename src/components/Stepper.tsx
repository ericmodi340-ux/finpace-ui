import { ReactElement, ReactNode, Fragment } from 'react';
import { m } from 'framer-motion';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Stepper as MUIStepper, Step, StepLabel, Box, Typography, Button } from '@mui/material';
// components
import Iconify from 'components/Iconify';
import { varBounce } from 'components/animate';
import BackButton from 'sections/@dashboard/form/FormStepper/pages/BackButton';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export type StepperStep = {
  label?: string;
  icon?: string;
  heading?: string;
  description?: ReactElement | string;
  buttonText?: string;
  content?: ReactNode;
  hiddenFromNav?: boolean;
  showBackButton?: boolean;
  onBack?: VoidFunction;
  props?: any;
  clickable?: boolean;
  tooltip?: string;
};

interface Props {
  steps: StepperStep[];
  activeStep?: number;
  handleNext: VoidFunction;
  maxWidth?: number | string;
  className?: string;
  dataTest?: string;
  other?: { [key: string]: any };
  handleBack: VoidFunction;
}

// ----------------------------------------------------------------------

export default function Stepper({
  steps,
  activeStep: activeStepIdx = 0,
  handleNext,
  maxWidth,
  className = '',
  dataTest = '',
  handleBack,
  ...other
}: Props) {
  const theme = useTheme();
  const activeStep = steps[activeStepIdx];
  const { heading, description, content, buttonText } = activeStep || {};
  const shouldShowBackButton =
    activeStep?.showBackButton && activeStepIdx !== 0 && activeStepIdx !== steps.length - 1;

  return (
    <RootStyle className={className} data-test={dataTest}>
      <MUIStepper
        className="stepper-nav"
        activeStep={activeStepIdx}
        alternativeLabel
        {...other}
        sx={{
          flex: 0,
          justifyContent: 'center',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        {steps.map((step, idx) => {
          if (step.hiddenFromNav) {
            return <Fragment key={idx} />;
          }

          return (
            <Step key={idx} sx={{ maxWidth: '100px' }}>
              <StepLabel
                icon={
                  <Box
                    width={36}
                    height={36}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        activeStepIdx >= idx ? theme.palette.primary.main : theme.palette.divider,
                      opacity: activeStepIdx > idx ? 0.25 : 1,
                      borderRadius: '50%',
                      color: '#fff',
                    }}
                  >
                    {step.icon ? (
                      <Iconify
                        icon={activeStepIdx > idx ? 'eva:checkmark-fill' : step.icon}
                        width={22}
                        height={22}
                        color="#fff"
                      />
                    ) : (
                      <Typography variant="overline" fontSize="22px">
                        {idx + 1}
                      </Typography>
                    )}
                  </Box>
                }
              >
                {step.label || `Step ${idx + 1}`}
              </StepLabel>
            </Step>
          );
        })}
      </MUIStepper>
      <Box
        className="stepper-tab"
        sx={{
          position: 'relative',
          flex: 1,
          // On small devices change width to 100%
          // width: extraLarge ? 'calc(80% - 230px)' : '100%', // 80% of width and subtract stepper-nav width
          width: '100%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '30px 0',
          minHeight: '420px',
        }}
      >
        {heading && (
          <m.div variants={varBounce().in}>
            <Typography
              variant="h3"
              paragraph
              className={`stepper-heading ${
                activeStep.label ? `stepper-heading-${activeStep.label}` : ''
              }`}
              data-test={dataTest ? `${dataTest}-page-heading` : ''}
              sx={{ minHeight: '70px' }}
            >
              {heading}
            </Typography>
          </m.div>
        )}
        {description && (
          <Typography sx={{ color: 'text.secondary', minHeight: '50px' }}>{description}</Typography>
        )}

        {content}

        {buttonText && (
          <Box sx={{ py: 3, display: 'flex', margin: 'auto' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              sx={{ flex: 1, minWidth: '277px' }}
              data-test={dataTest ? `${dataTest}-continue-button` : ''}
            >
              {buttonText}
            </Button>
          </Box>
        )}
        <Box
          sx={{
            position: { xs: 'relative', md: 'absolute' },
            top: { md: '50%' },
            marginTop: { xs: 3, md: 0 },
            left: 0,
            transform: { md: 'translateY(-50%)' },
          }}
        >
          {shouldShowBackButton && (
            <BackButton onBack={activeStep.onBack ? activeStep.onBack : handleBack} />
          )}
        </Box>
      </Box>
    </RootStyle>
  );
}
