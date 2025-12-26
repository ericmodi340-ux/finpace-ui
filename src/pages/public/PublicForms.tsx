import {
  Typography,
  Paper,
  Step,
  StepLabel,
  Stepper,
  styled,
  Container,
  Stack,
  Card,
  useTheme,
  Box,
} from '@mui/material';
import { TemplateWithFieldsManager } from '../../@types/template';
import { ClientPublicForm } from 'components/public';
import { useEffect, useState } from 'react';
import { FormManager } from '../../@types/form';
import { Helmet } from 'react-helmet-async';
import { FormFinalize, FormRenderer } from 'sections/@dashboard/form/FormStepper/pages';
import Iconify from 'components/Iconify';
import Logo from 'components/Logo';
import Image from 'components/Image';
import useSettings from 'hooks/useSettings';
import { getPublicTemplate } from 'redux/slices/templates';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from 'components/LoadingScreen';
import FormRendererV2 from 'sections/@dashboard/form/FormStepper/pages/FormRendererV2';

const RootStyle = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.neutral,
  minHeight: '100vh',
}));

function PublicForms() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormManager>({} as FormManager);
  const [template, setTemplate] = useState<TemplateWithFieldsManager>(
    {} as TemplateWithFieldsManager
  );
  const [client, setClient] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [showReviewIcon, setShowReviewIcon] = useState(false);
  const [searchParams] = useSearchParams();
  const firmId = searchParams.get('firmId');
  const templateId = searchParams.get('templateId');

  const { themeMode } = useSettings();

  const theme = useTheme();

  const handleNext = (sendForReview?: boolean) => {
    setShowReviewIcon(!!sendForReview);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  useEffect(() => {
    async function fetchTemplate() {
      if (templateId && firmId && !template?.id) {
        setLoading(true);
        const resp = await getPublicTemplate({ templateId, firmId });
        if (resp) {
          setTemplate(resp);
        }
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [firmId, template, templateId]);

  const steps = [
    {
      label: 'Basics',
      wrapInContainer: true,
      heading: template?.publicFormFirstHeading || 'Give us the basics',
      icon: 'eva:file-text-fill',
      description: template?.publicFormFirstSubHeading || 'Please fill in the information below',
      content: (
        <ClientPublicForm {...{ setForm, setTemplate, setClient }} handleNext={handleNext} />
      ),
    },
    {
      label: 'Details',
      icon: 'eva:clipboard-fill',
      heading: '',
      wrapInContainer: false,
      description: '',
      content: template?.surveyJsEnabled ? (
        <FormRendererV2
          formId={form?.id}
          form={form}
          authUser={client}
          onContinue={() => handleNext()}
          template={{
            ...template,
            id: `${template.id}::0`,
          }}
          isPublic={true}
          setUserCompletedForms={() => null}
        />
      ) : (
        <FormRenderer
          formId={form?.id}
          form={form}
          authUser={client}
          onContinue={() => handleNext()}
          template={{
            ...template,
            id: `${template.id}::0`,
          }}
          isPublic={true}
          setUserCompletedForms={() => null}
        />
      ),
    },
    {
      label: 'Finalize',
      wrapInContainer: false,
      icon: 'eva:checkmark-circle-2-fill',
      heading: template?.redirectOnComplete
        ? template.onCompleteHeading
        : 'What would you like to do?',
      description: template?.redirectOnComplete
        ? template.onCompleteSubHeading
        : "Select how you'd like to finalize this form now.",
      content: (
        <FormFinalize
          formId={form?.id}
          template={template}
          onContinue={(sendForReview) => handleNext(sendForReview)}
          userCompletedForm={{ [template.id]: true }}
          selectedTemplates={
            template.compositeTemplates || [
              {
                signers: ['client_1', 'client_2', 'advisor', 'firm'],
                templateId: template.id,
              },
            ]
          }
          form={form}
          authUser={client}
          isPublic={true}
        />
      ),
    },
    {
      label: 'Next Steps',
      wrapInContainer: true,
      icon: 'eva:checkmark-circle-2-fill',
      heading: '',
      description: '',
      content: (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center', my: 3 }}>
          <Image
            src={
              showReviewIcon
                ? `/assets/illustrations/form-send-for-review-icon-light-mode.svg`
                : `/assets/illustrations/form-completion-icon-${themeMode}-mode.svg`
            }
            sx={{ width: 120, height: 120 }}
          />
          {themeMode === 'light' ? (
            <Typography
              sx={{
                background: 'linear-gradient(to right, #00273F, #005F84, #09E1C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
              }}
              variant="h3"
            >
              You're Done!
            </Typography>
          ) : (
            <Typography variant="h3">You're Done!</Typography>
          )}

          <Typography
            variant="h5"
            sx={{
              fontWeight: 'light',
              mt: 1,
            }}
          >
            You can close this window. We will be in touch soon.
          </Typography>
        </Stack>
      ),
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Get Started</title>
      </Helmet>
      {/* <Stack
        mt={2}
        ml={activeStep === 0 ? 0 : 5}
        alignItems={activeStep === 0 ? 'center' : 'flex-start'}
        justifyContent={'center'}
      >
        <LogoIcon />
      </Stack> */}
      <RootStyle>
        <Stack
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            px: 3,
            py: 2,
            position: 'sticky',
            width: '100%',
            top: 0,
            zIndex: 1,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            sx={{
              position: 'fixed',
              top: 10,
              left: 30,
            }}
          >
            <Logo
              sx={{
                fontWeight: 'bold',
                fontSize: '1.4rem',
                width: 'auto',
                maxWidth: 180,
              }}
            />
          </Stack>
          <Container maxWidth="md">
            <Stepper sx={{ flex: 0 }} activeStep={activeStep} alternativeLabel>
              {steps.map((step, idx) => (
                <Step key={idx}>
                  <StepLabel
                    slotProps={{
                      label: {
                        style: {
                          marginTop: 10,
                        },
                      },
                    }}
                    icon={
                      <Box
                        width={30}
                        height={30}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            activeStep >= idx ? theme.palette.primary.main : theme.palette.divider,
                          opacity: activeStep > idx ? 0.25 : 1,
                          borderRadius: '50%',
                          color: '#fff',
                        }}
                      >
                        {step.icon ? (
                          <Iconify
                            icon={activeStep > idx ? 'eva:checkmark-fill' : step.icon}
                            width={16}
                            height={16}
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
              ))}
            </Stepper>
          </Container>
        </Stack>

        {!steps[activeStep].wrapInContainer ? (
          <Stack
            sx={{
              flex: 1,
              width: '100%',
              height: '100%',
            }}
          >
            {steps[activeStep].content}
          </Stack>
        ) : (
          <Container
            sx={{
              flex: 1,
            }}
            maxWidth="md"
          >
            <Card
              sx={{
                my: { xs: 10, md: 8 },
                display: 'flex',
                padding: 3,
                paddingY: steps[activeStep].heading ? 5 : 0,
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                overflow: 'visible',
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  maxWidth: 590,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {steps[activeStep].heading && (
                  <Typography variant="h3" paragraph data-test="new-client-stepper-page-heading">
                    {steps[activeStep].heading}
                  </Typography>
                )}

                {!steps[activeStep].heading && template?.addFirmLogoOnForm && (
                  <Logo
                    sx={{
                      width: 'auto',
                      maxWidth: 180,
                      mt: 3,
                      mb: -2,
                    }}
                  />
                )}

                {steps[activeStep].description && (
                  <Typography sx={{ color: 'text.secondary', mb: 4 }}>
                    {steps[activeStep].description}
                  </Typography>
                )}

                {steps[activeStep].content}
              </Stack>
            </Card>
          </Container>
        )}
      </RootStyle>
    </>
  );
}

export default PublicForms;
