import { useState, useEffect, Dispatch, SetStateAction, useMemo, Fragment } from 'react';
// @mui
import {
  Stepper as MUIStepper,
  IconButton,
  Box,
  Stack,
  Step,
  StepLabel,
  Typography,
  useTheme,
  Container,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  DialogContent,
  CircularProgress,
  Tooltip,
} from '@mui/material';
// components
import { StepperStep } from 'components/Stepper';
// pages
import {
  AdvisorSelect,
  TemplateSelect,
  FormInitializer,
  FormRenderer,
  FormFinalize,
  NextSteps,
  TemplateSelectMultiple,
} from './pages';
// @types
import { CompositeTemplate, FormManager, FormReviewer, FormStatus } from '../../../../@types/form';
import { ClientManager } from '../../../../@types/client';
import { UserRole } from '../../../../@types/user';
// redux
import { dispatch, useSelector } from 'redux/store';
import { getForms } from 'redux/slices/forms';
import { getEnvelopes } from 'redux/slices/envelopes';
import { getTemplate, getTemplates } from 'redux/slices/templates';
// hooks
import useForm from 'hooks/useForm';
import useFullTemplate from 'hooks/useFullTemplate';
import useUser from 'hooks/useUser';
import useUserFromStore from 'hooks/useUserFromStore';
// utils
import { getParams } from 'utils/params';
import { getClientCompositeName } from 'utils/clients';
// constants
import { formStatuses } from 'constants/forms';
import { roles } from 'constants/users';
import FormAdvisorDocs from './pages/FormAdvisorPdfs';
import { isGWN } from 'utils/firm';
import Iconify from 'components/Iconify';
import FundAllocator from 'components/form/custom/firms/gwn/FundAllocator/FundAllocator';
import OrionAccountsSelect from './pages/OrionAccountsSelect';
import { TemplateManager } from '../../../../@types/template';
import Scrollbar from 'components/Scrollbar';
import LoadingScreen from 'components/LoadingScreen';
import Logo from 'components/Logo';
import useSettings from 'hooks/useSettings';
import Image from 'components/Image';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import FormRendererV2 from './pages/FormRendererV2';

// ----------------------------------------------------------------------

export default function FormStepper({
  isEdit,
  isReadOnly: isReadOnlyFromProps,
  formId,
  handleClose,
  setCurrentFormId,
}: {
  isEdit: boolean;
  isReadOnly: boolean;
  formId: string | undefined;
  handleClose: VoidFunction;
  setCurrentFormId: Dispatch<SetStateAction<string>>;
}) {
  const { user, authUser } = useUser();
  const params = getParams();

  const navigate = useNavigate();

  const { themeMode } = useSettings();

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const [sendMultipleForms, setSendMultipleForms] = useState(false);

  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const isAdvisor = [roles.FIRM_ADMIN, roles.ADVISOR].includes(authUser?.role);

  const formFromStore = useForm(formId);
  const [currentForm, setCurrentForm] = useState<FormManager>(
    formFromStore ||
      ({
        templateId: params?.templateId,
        advisorId: params?.advisorId,
        clientId: params?.clientId,
        createdAt: new Date(),
        status: formStatuses.DRAFT,
        reviewers: [] as FormReviewer[],
        currentReviewerRole: isAdvisor ? UserRole.ADVISOR : UserRole.CLIENT,
      } as FormManager)
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    currentForm?.templateId || params.templateId || ''
  );

  const [selectedTemplates, setSelectedTemplates] = useState<CompositeTemplate[]>([]);

  const [templates, setTemplates] = useState<TemplateManager[]>([]);

  const selectedClient = useUserFromStore(
    params.clientId || currentForm?.clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;
  const { template: selectedTemplate } = useFullTemplate(selectedTemplateId);

  const [advisorDocs, setAdvisorDocs] = useState<{ link: string; name: string }[]>([]);

  const theme = useTheme();

  const [userCompletedForm, setUserCompletedForms] = useState<Record<string, boolean>>({});

  const { loaded: formsAlreadyLoaded } = useSelector((state) => state.forms);
  const { loaded: templatesAlreadyLoaded } = useSelector((state) => state.templates);
  const { loaded: envelopAlreadyLoaded } = useSelector((state) => state.envelopes);

  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const isReadOnly =
    isReadOnlyFromProps ||
    currentForm?.status === FormStatus.CANCELLED ||
    currentForm?.status === FormStatus.COMPLETED;

  const [compositeTemplateSteps, setCompositeTemplateSteps] = useState<StepperStep[]>([
    {
      icon: 'eva:clipboard-fill',
      label: 'Forms',
      content: <LoadingScreen />,
    },
  ]);

  useEffect(() => {
    const fetchCompositeTemplates = async () => {
      if (
        !!currentForm.compositeTemplates?.length &&
        compositeTemplateSteps[0].label === 'Forms' &&
        !loadingTemplates
      ) {
        setLoadingTemplates(true);
        const templates = await Promise.all(
          currentForm.compositeTemplates.map((t) => getTemplate(t.templateId, false))
        );

        setTemplates(templates);

        const steps: StepperStep[] = templates.map((t, idx) => ({
          label: `Form ${idx + 1}`,
          icon: 'eva:clipboard-fill',
          showBackButton: false,
          props: {
            formId,
            template: {
              ...t,
              id: `${t.id}::${idx}`,
            },
          },
          tooltip: t.title,
        }));

        setLoadingTemplates(false);

        setCompositeTemplateSteps(steps);

        const completedForms = templates.reduce(
          (acc, t, idx) => {
            acc[`${t.id}::${idx}`] = false;
            return acc;
          },
          {} as Record<string, boolean>
        );

        setUserCompletedForms(completedForms);
      }
    };

    fetchCompositeTemplates();
  }, [compositeTemplateSteps, currentForm.compositeTemplates, formId, loadingTemplates]);

  useEffect(() => {
    !envelopAlreadyLoaded && dispatch(getEnvelopes());
  }, [envelopAlreadyLoaded]);

  useEffect(() => {
    !formsAlreadyLoaded && dispatch(getForms());
  }, [formsAlreadyLoaded]);

  useEffect(() => {
    !templatesAlreadyLoaded && dispatch(getTemplates());
  }, [templatesAlreadyLoaded]);

  // Update currentForm and selectedTemplateId
  useEffect(() => {
    if (formFromStore && isEdit) setCurrentForm(formFromStore as FormManager);
  }, [formFromStore, isEdit]);

  useEffect(() => {
    if (currentForm && currentForm.templateId) setSelectedTemplateId(currentForm.templateId);
  }, [currentForm]);

  useEffect(() => {
    if (!currentForm?.advisorId) {
      let newAdvisorId;

      if (authUser?.role !== roles.FIRM_ADMIN && selectedClient?.advisorId) {
        newAdvisorId = selectedClient?.advisorId;
      }

      if (newAdvisorId) {
        handleSetForm({ advisorId: newAdvisorId });
      }
    }
  }, [authUser?.role, currentForm?.advisorId, selectedClient, selectedClient?.advisorId]);

  useEffect(() => {
    if (selectedTemplate?.title && !currentForm.formTitle) {
      setCurrentForm((currForm) => ({ ...currForm, formTitle: selectedTemplate.title }));
    }
  }, [selectedTemplate?.title, currentForm.formTitle]);

  const handleSetForm = (updateForm: Partial<FormManager>) => {
    setCurrentForm((currentForm) => ({ ...currentForm, ...updateForm }));
  };

  const handleBack = () => {
    setActiveStepIdx((prevActiveStep) => prevActiveStep - 1);
  };

  const restartForm = () => {
    setActiveStepIdx(0);
  };

  const clientName = useMemo(() => getClientCompositeName(selectedClient), [selectedClient]);

  const PAGE_COMPONENTS = {
    TemplateSelect: (
      <TemplateSelect
        onContinue={handleNext}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        setSelectedTemplates={setSelectedTemplates}
        setSendMultipleForms={setSendMultipleForms}
        sx={{ maxWidth: { md: 600 } }}
      />
    ),
    TemplateSelectMultiple: (
      <TemplateSelectMultiple
        handleSetForm={handleSetForm}
        onContinue={handleNext}
        setSelectedTemplateId={setSelectedTemplateId}
        setSelectedTemplates={setSelectedTemplates}
        setSendMultipleForms={setSendMultipleForms}
      />
    ),
    OrionAccountSelect: (
      <OrionAccountsSelect
        currentForm={currentForm}
        onContinue={handleNext}
        handleSetForm={handleSetForm}
        selectedClient={selectedClient}
      />
    ),
    AdvisorSelect: <AdvisorSelect currentForm={currentForm} handleSetForm={handleSetForm} />,
    FormInitializer: (
      <FormInitializer
        currentForm={currentForm}
        selectedTemplateId={selectedTemplateId}
        selectedTemplates={selectedTemplates}
        setCurrentFormId={setCurrentFormId}
        setCurrentForm={setCurrentForm}
        onContinue={handleNext}
      />
    ),
    FormLoading: <CircularProgress sx={{ my: 5 }} />,
    FundAllocator: (
      <FundAllocator
        formId={formId}
        // template={selectedTemplate}
        onContinue={handleNext}
        // isReadOnly={isReadOnly}
        // allowUserToBypassRequired={allowUserToBypassRequired}
      />
    ),
    FormFinalize: (
      <FormFinalize
        formId={formId}
        template={selectedTemplate}
        selectedTemplates={selectedTemplates}
        userCompletedForm={userCompletedForm}
        onContinue={handleNext}
        advisorDocs={advisorDocs}
        authUser={authUser}
      />
    ),
    NextSteps: <NextSteps handleClose={handleClose} currentForm={currentForm} formId={formId} />,
    AdvisorDocs: <FormAdvisorDocs onContinue={handleNext} setAdvisorDocs={setAdvisorDocs} />,
  };

  const STEPS: { [key: string]: StepperStep } = {
    TemplateSelect: {
      label: 'Template',
      icon: 'eva:file-text-fill',
      heading: 'Choose your template below',
      description: '',
      content: PAGE_COMPONENTS.TemplateSelect,
      showBackButton: false,
    },
    TemplateSelectMultiple: {
      label: 'Templates',
      icon: 'eva:file-text-fill',
      heading: 'Choose your template(s) below',
      description: '',
      content: PAGE_COMPONENTS.TemplateSelectMultiple,
      showBackButton: false,
    },
    OrionAccountSelect: {
      label: 'Accounts',
      icon: 'eva:file-text-fill',
      heading: 'Select Custodial Accounts',
      description: <>Please select or add client's custodial accounts.</>,
      content: PAGE_COMPONENTS.OrionAccountSelect,
      showBackButton: true,
      clickable: true,
      onBack: restartForm,
    },
    AdvisorSelect: {
      label: 'Advisor',
      icon: 'eva:person-fill',
      heading: 'Who is the client working with?',
      description: <>Please select the client's advisor below.</>,
      content: PAGE_COMPONENTS.AdvisorSelect,
      showBackButton: true,
    },
    FormInitializer: {
      label: 'Prepare',
      icon: 'eva:cloud-download-fill',
      heading: 'Preparing your form',
      description: 'Please give us a couple of seconds to get your form ready...',
      content: PAGE_COMPONENTS.FormInitializer,
    },
    FormLoading: {
      label: 'Loading...',
      icon: 'eva:loading-fill',
      heading: '',
      description: '',
      content: PAGE_COMPONENTS.FormLoading,
      showBackButton: false,
    },
    FundAllocator: {
      label: 'Allocator',
      icon: 'eva:clipboard-fill',
      heading: 'Allocate Models/Funds',
      description: '',
      content: PAGE_COMPONENTS.FundAllocator,
      showBackButton: true,
    },
    AdvisorDocs: {
      label: authUser?.role === roles.CLIENT ? 'Statements' : 'Docs',
      icon: 'eva:file-text-fill',
      heading: 'Upload Your Statements',
      content: PAGE_COMPONENTS.AdvisorDocs,
      showBackButton: true,
      clickable: true,
    },
    FormFinalize: {
      label: 'Finalize',
      icon: 'eva:edit-2-fill',
      heading:
        !isAdvisor && selectedTemplate?.redirectOnComplete
          ? selectedTemplate?.onCompleteHeading
          : 'What would you like to do?',
      description:
        !isAdvisor && selectedTemplate?.redirectOnComplete
          ? selectedTemplate?.onCompleteSubHeading
          : "Select how you'd like to finalize this form now.",
      content: PAGE_COMPONENTS.FormFinalize,
      showBackButton: true,
    },
    NextSteps: {
      label: 'Next Steps',
      icon: 'eva:checkmark-circle-2-fill',
      heading: "You're all set!",
      description: isGWN(user?.firmId)
        ? 'Do you want to open a new account?'
        : "We'll email you with any updates on this form!",
      content: PAGE_COMPONENTS.NextSteps,
      showBackButton: true,
    },
  };

  const showOrionAccountSelect = useMemo(() => templates?.some((item) => item.orion), [templates]);

  const newCompositeTemplateSteps = useMemo(
    () =>
      compositeTemplateSteps.map((step) => ({
        ...step,
        clickable: true,
        content: step?.props?.template?.surveyJsEnabled ? (
          <FormRendererV2
            {...step?.props}
            key={step.label}
            authUser={authUser}
            onContinue={handleNext}
            setUserCompletedForms={setUserCompletedForms}
            isReadOnly={isReadOnly}
            orionAccountNumber={currentForm?.orionAccountNumber}
          />
        ) : (
          <FormRenderer
            {...step?.props}
            key={step.label}
            authUser={authUser}
            onContinue={handleNext}
            setUserCompletedForms={setUserCompletedForms}
            isReadOnly={isReadOnly}
            orionAccountNumber={currentForm?.orionAccountNumber}
          />
        ),
      })),
    [authUser, compositeTemplateSteps, currentForm?.orionAccountNumber, handleNext, isReadOnly]
  );

  // const isFormFullyCompleted = useMemo(
  //   () => Object.values(userCompletedForm).every((val) => val),
  //   [userCompletedForm]
  // );

  const stepList: StepperStep[] = useMemo(
    () =>
      isReadOnlyFromProps
        ? [...newCompositeTemplateSteps]
        : [
            ...(!isEdit
              ? [sendMultipleForms ? STEPS.TemplateSelectMultiple : STEPS.TemplateSelect]
              : []),
            // TODO: [DEV-267] Add client select for new forms if clientId is not passed
            ...(authUser?.role === roles.FIRM_ADMIN && !isEdit && !currentForm.advisorId
              ? [STEPS.AdvisorSelect]
              : []),
            ...(!isEdit ? [STEPS.FormInitializer] : []),
            ...(showOrionAccountSelect && isAdvisor ? [STEPS.OrionAccountSelect] : []),
            ...(loadingTemplates ? [STEPS.FormLoading] : [...newCompositeTemplateSteps]),
            ...(selectedTemplate?.showFundAllocator ? [STEPS.FundAllocator] : []),
            // ...(selectedTemplate?.signingEvent && isFormFullyCompleted ? [STEPS.AdvisorDocs] : []),
            STEPS.FormFinalize,
            ...(authUser?.role !== roles.CLIENT ? [STEPS.NextSteps] : []),
          ],
    [
      isReadOnlyFromProps,
      newCompositeTemplateSteps,
      isEdit,
      sendMultipleForms,
      STEPS.TemplateSelectMultiple,
      STEPS.TemplateSelect,
      STEPS.AdvisorSelect,
      STEPS.FormInitializer,
      STEPS.OrionAccountSelect,
      STEPS.FormLoading,
      STEPS.FundAllocator,
      STEPS.FormFinalize,
      STEPS.NextSteps,
      authUser?.role,
      currentForm.advisorId,
      showOrionAccountSelect,
      isAdvisor,
      loadingTemplates,
      selectedTemplate?.showFundAllocator,
    ]
  );

  const activeStep = stepList[activeStepIdx];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleNext() {
    if (activeStep === stepList.length - 1) {
      handleClose();
    } else {
      setActiveStepIdx((prevActiveStep) => prevActiveStep + 1);
    }
  }

  // client can not review form if they are not the current reviewer
  if (!isAdvisor && currentForm?.currentReviewerRole === UserRole.ADVISOR) {
    return (
      <Container
        maxWidth="xs"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Stack sx={{ pt: 10, alignItems: 'center', justifyContent: 'center', my: 3 }}>
          <Image
            src={`/assets/illustrations/form-completion-icon-${themeMode}-mode.svg`}
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
              You're All Set!
            </Typography>
          ) : (
            <Typography variant="h3">You're All Set!</Typography>
          )}

          <Typography
            variant="body1"
            sx={{
              fontWeight: 'light',
              textAlign: 'center',
              mt: 1,
            }}
          >
            Your advisor will review this form and get back to you.
          </Typography>
          <Button
            sx={{
              mt: 3,
            }}
            size="medium"
            variant="contained"
            onClick={() => {
              navigate(PATH_DASHBOARD.root);
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  const { content } = activeStep || {};

  // const shouldShowBackButton =
  //   activeStep?.showBackButton && activeStepIdx !== 0 && activeStepIdx !== stepList.length - 1;

  return (
    <Stack
      position="relative"
      sx={{
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.neutral,
      }}
    >
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
        <Stack
          sx={{
            position: 'fixed',
            top: 10,
            left: 25,
            display: { xs: 'none', md: 'flex' },
            zIndex: 10,
          }}
        >
          <Logo
            disabledLink
            sx={{
              fontWeight: 'bold',
              fontSize: '1.4rem',
              width: 'auto',
              maxWidth: 180,
            }}
          />
        </Stack>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center">
            {!loadingTemplates &&
              stepList[activeStepIdx - 1] &&
              stepList[activeStepIdx - 1]?.clickable && (
                <IconButton onClick={() => setActiveStepIdx(activeStepIdx - 1)}>
                  <Iconify icon="eva:arrow-ios-back-fill" width={25} height={25} />
                </IconButton>
              )}

            <Scrollbar>
              <MUIStepper
                className="stepper-nav"
                activeStep={activeStepIdx}
                alternativeLabel
                sx={{
                  flex: 0,
                  justifyContent: 'center',
                }}
              >
                {stepList.map((step, idx) => {
                  if (step.hiddenFromNav) {
                    return <Fragment key={idx} />;
                  }

                  return (
                    <Tooltip title={step.tooltip} key={idx}>
                      <Step
                        sx={{
                          maxWidth: '100px',
                          minWidth: '100px',
                        }}
                        key={idx}
                      >
                        <StepLabel
                          slotProps={{
                            label: {
                              style: {
                                marginTop: 10,
                              },
                            },
                          }}
                          sx={{
                            cursor:
                              (isReadOnlyFromProps || activeStepIdx >= idx) && step.clickable
                                ? 'pointer'
                                : 'default',
                          }}
                          onClick={() => {
                            if ((isReadOnlyFromProps || activeStepIdx >= idx) && step.clickable) {
                              setActiveStepIdx(idx);
                            }
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
                                  isReadOnlyFromProps || activeStepIdx >= idx
                                    ? theme.palette.primary.main
                                    : theme.palette.divider,
                                opacity: activeStepIdx > idx ? 0.7 : 1,
                                borderRadius: '50%',
                                color: '#fff',
                              }}
                            >
                              {step.icon ? (
                                <Iconify
                                  icon={activeStepIdx > idx ? 'eva:checkmark-fill' : step.icon}
                                  width={16}
                                  height={16}
                                  color={activeStepIdx > idx ? '#fff' : '#fff'}
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
                    </Tooltip>
                  );
                })}
              </MUIStepper>
            </Scrollbar>
            {!loadingTemplates &&
              stepList[activeStepIdx + 1] &&
              stepList[activeStepIdx + 1]?.clickable && (
                <IconButton onClick={() => setActiveStepIdx(activeStepIdx + 1)}>
                  <Iconify icon="eva:arrow-ios-forward-fill" width={30} height={30} />
                </IconButton>
              )}
          </Stack>
        </Container>
      </Stack>
      <Stack
        sx={{
          flex: 1,
        }}
      >
        {content}
      </Stack>
      {/* <Container
        maxWidth="md"
        sx={{
          flex: 1,
        }}
      >
        <Card
          sx={{
            my: { xs: 10, md: 8 },
            display: 'flex',
            paddingX: 3,
            paddingY: heading || isReadOnlyFromProps ? 3 : 0,
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
              maxWidth: 650,
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {heading && (
              <Typography
                variant="h3"
                paragraph
                className={`stepper-heading ${
                  activeStep.label ? `stepper-heading-${activeStep.label}` : ''
                }`}
              >
                {heading}
              </Typography>
            )}
            {!heading && selectedTemplate?.addFirmLogoOnForm && !isReadOnly && (
              <Logo
                disabledLink
                sx={{
                  width: 'auto',
                  maxWidth: 180,
                  mt: 3,
                  mb: -2,
                }}
              />
            )}
            {description && <Typography sx={{ color: 'text.secondary' }}>{description}</Typography>}

            {content}

            {buttonText && (
              <Box sx={{ py: 3, display: 'flex', margin: 'auto' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNext}
                  sx={{ flex: 1, minWidth: '277px' }}
                >
                  {buttonText}
                </Button>
              </Box>
            )}
          </Stack>
        </Card>
      </Container> */}
      <Box
        sx={{
          ml: 2,
          flex: 0,
          position: 'fixed',
          top: 25,
          right: 35,
          zIndex: 10,
        }}
      >
        <Typography variant="subtitle1" component="div">
          {isReadOnly ? (
            <IconButton onClick={handleClose}>
              <Iconify height={30} width={30} icon={`ic:round-close`} />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                if (activeStepIdx === stepList.length - 1) {
                  return handleClose();
                }
                setCancelConfirmOpen(true);
              }}
              sx={{
                color: 'text.disabled',
                typography: 'body2',
              }}
            >
              <Iconify height={30} width={30} icon={`ic:round-close`} />
            </IconButton>
          )}
        </Typography>
      </Box>

      <Dialog open={cancelConfirmOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {!!currentForm?.id
              ? 'Canceling now will save changes on any steps that have been completed. You will be able to continue the form at a later time.'
              : 'You will lose any changes that have been entered. No form has been created.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            No, go back
          </Button>
          <Button variant="contained" onClick={handleClose} sx={{ textTransform: 'none' }}>
            Yes, cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
