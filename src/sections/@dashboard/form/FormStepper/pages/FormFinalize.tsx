import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Alert, AlertTitle, Box, Container, Tooltip, Card, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import {
  CompositeTemplate,
  FormFinalizeType,
  FormManager,
  FormStatus,
} from '../../../../../@types/form';
import {
  EnvelopeDeliveryMethod,
  EnvelopeDisclosureDoc,
  EnvelopeFinalizeType,
  EnvelopeManager,
} from '../../../../../@types/envelope';
import { TemplateWithFieldsManager } from '../../../../../@types/template';
import { ClientManager, FINPACE_CLIENT_DEFAULT_FIELDS } from '../../../../../@types/client';
import { AdvisorManager } from '../../../../../@types/advisor';
import { UserRole } from '../../../../../@types/user';
// redux
import { useSelector } from 'redux/store';
import { updateClient } from 'redux/slices/clients';
import { updateForm, updatePublicForm } from 'redux/slices/forms';
import { createEnvelope, finalizeEnvelope } from 'redux/slices/envelopes';
// components
import EnvelopeSigningScreen from 'components/EnvelopeSigningScreen';
import Iconify from 'components/Iconify';
// constants
import { formFinalizeTypes, formStatuses } from 'constants/forms';
import { envelopeDeliveryMethods, envelopeFinalizeTypes } from 'constants/envelopes';
import { roles } from 'constants/users';
// hooks
import useForm from 'hooks/useForm';
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUserFromStore from 'hooks/useUserFromStore';
// utils
import { getDisclosureName } from 'utils/disclosures';
import { getClientName } from 'utils/clients';
import { fDate } from 'utils/formatTime';
import PreviewSigningScreen from '../../../../../components/PreviewSigningScreen';
import { cloneDeep, isEqual } from 'lodash';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';
import { AuthUserType } from '../../../../../@types/auth';

// ----------------------------------------------------------------------

export default function FormFinalize({
  formId,
  template,
  onContinue,
  userCompletedForm,
  advisorDocs,
  authUser,
  form,
  isPublic = false,
}: {
  formId: string | undefined;
  template: TemplateWithFieldsManager | undefined | null;
  onContinue: (isSendForReview?: boolean) => void;
  authUser: AuthUserType;
  userCompletedForm: Record<string, boolean>;
  advisorDocs?: { link: string; name: string }[] | undefined;
  form?: FormManager;
  isPublic?: boolean;
  selectedTemplates: CompositeTemplate[];
}) {
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSignNow, setIsSignNow] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const navigate = useRouter();

  const { firm } = useSelector((state: any) => state.firm);

  // Set initial state for form and cacheForm
  const initialFormManager = {} as FormManager;
  const [cacheForm, setCacheForm] = useState(initialFormManager);
  const initialForm = useForm(formId) || form;
  const [currentForm, setCurrentForm] = useState(initialForm);
  const [currentLoadingButton, setCurrentLoadingButton] = useState('');

  const isAdvisor = [roles.FIRM_ADMIN, roles.ADVISOR].includes(authUser?.role);

  // Hide button go back from Stepper when we are in preview option or signing option
  useEffect(() => {
    const button = document.querySelector('.backButton') as HTMLElement;

    if (button) {
      if (isPreview || isSignNow || (currentForm?.envelopeId && currentForm?.status !== 'sent')) {
        button.style.display = 'none';
      } else {
        button.style.display = '';
      }
    }
  }, [currentForm?.envelopeId, currentForm?.status, isPreview, isSignNow]);

  useEffect(() => {
    // Remove envelopeId if already present in initialForm
    async function InitForm() {
      if (initialForm?.envelopeId) {
        setLoading(true);
        const response = await updateForm(initialForm.id, {
          ...initialForm,
          envelopeId: '',
        });
        setCurrentForm(response);
        setLoading(false);
      } else {
        setCurrentForm(initialForm);
      }
    }

    InitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { signingEventType = 'docusign' } = template ?? {};

  const client = useUserFromStore(
    currentForm?.clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;

  const advisor = useUserFromStore(
    currentForm?.advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;

  // Not sure what it does for now
  // useEffect(() => {
  //   if (finalizeType) {
  //     setLoading(true);
  //   }
  // }, [finalizeType]);

  if (!currentForm) {
    return (
      <>
        <Alert severity="warning" sx={{ textAlign: 'left', my: 3 }}>
          <AlertTitle>Form not found</AlertTitle>We couldn't find this form.
          <br />
          Please try again and contact Bitsy if the problem persists.
        </Alert>
      </>
    );
  }

  const { submission } = currentForm || {};

  if (!template) {
    return (
      <>
        <Alert severity="warning" sx={{ textAlign: 'left', my: 3 }}>
          <AlertTitle>Template not found</AlertTitle>We couldn't find the template for this form.
          <br />
          Please try again and contact Bitsy if the problem persists.
        </Alert>
      </>
    );
  }

  const prepareEnvelope = async (form: FormManager) => {
    // Generate disclosureDocs
    let disclosureDocs: EnvelopeDisclosureDoc[] = [];
    // let advisorDisclosures: EnvelopeDisclosureDoc[] = advisorDocs || [];
    if (template.includeDisclosures) {
      // Firm disclosures
      if (template.includedFirmDisclosures.length) {
        disclosureDocs = template.includedFirmDisclosures.map((link) => ({
          name: getDisclosureName(link) || link,
          link,
        }));
      }
    }

    const {
      firstName,
      middleInitial,
      lastName,
      secondInvestor: {
        firstName: second_investor_firstName_v2,
        middleInitial: second_investor_middleInitial_v2,
        lastName: second_investor_lastName_v2,
      } = {} as any,
    } = submission?.[`${template.id}::0`] as any;

    const firstInvestorName =
      getClientName({
        first: firstName,
        middle: middleInitial,
        last: lastName,
      }) || client?.name;

    const secondInvestorName =
      getClientName({
        first: second_investor_firstName_v2,
        middle: second_investor_middleInitial_v2,
        last: second_investor_lastName_v2,
      }) || client.secondInvestor?.name;

    let compositeName = firstInvestorName;
    if (submission?.[`${template.id}::0`]?.includeSecondInvestor) {
      compositeName += ` & ${secondInvestorName}`;
    }

    return {
      formId: form.id,
      templateId: form.templateId,
      compositeTemplates: form?.compositeTemplates || [],
      client: {
        ...(submission || {}),
        gwn_funds_allocated: client?.custom?.gwn_funds_allocated,
        id: form.clientId,
        compositeName,
        name: firstInvestorName || '',
        email: client?.email,
        includeSecondInvestor: submission?.[`${template.id}::0`]?.includeSecondInvestor,
        secondInvestor: {
          ...(submission?.[`${template.id}::0`]?.secondInvestor || {}),
          email:
            submission?.[`${template.id}::0`]?.secondInvestor?.email ||
            client.secondInvestor?.email,
          name: secondInvestorName,
          phoneNumber:
            submission?.[`${template.id}::0`]?.secondInvestor?.phoneNumber ||
            client?.secondInvestor?.phoneNumber,
        },
        phoneNumber: submission?.[`${template.id}::0`]?.phoneNumber || client?.phoneNumber,
        currentDate: fDate(new Date(), 'MM/dd/yyyy'),
      },
      advisor: {
        id: form.advisorId,
        name: advisor?.name,
        email: advisor?.email,
        phoneNumber: advisor?.phoneNumber,
        masterAccountNumber: advisor?.masterAccountNumber,
      },
      firm: {
        name: firm.name,
        email: firm.email,
        schwabServiceTeam: firm?.schwabServiceTeam,
        phoneNumber: firm?.phoneNumber,
      },
      disclosureDocs,
      advisorDocs,
    };
  };

  const handleUpdateClient = async () => {
    try {
      const newClient: any = {
        custom: cloneDeep(client.custom || {}),
      };

      let clientInfo = {} as any;

      for (let i = 0; i < (currentForm?.compositeTemplates?.length || 0); i++) {
        const selectedTemplate = currentForm?.compositeTemplates?.[i];
        if (selectedTemplate && selectedTemplate.signers.includes('client_1')) {
          clientInfo = {
            ...clientInfo,
            ...cloneDeep(submission?.[`${selectedTemplate.templateId}::${i}`]),
          };
        }
      }

      // TODO: we need to do the same for clientInfo.secondInvestor
      if (clientInfo?.driversLicenseNumber) {
        const driversLicense = clientInfo.ids?.find((id: any) => id.type === 'driversLicense');
        if (driversLicense) {
          if (driversLicense.number !== clientInfo.driversLicenseNumber) {
            driversLicense.number = clientInfo.driversLicenseNumber;
          }
        } else {
          clientInfo.ids = [
            ...(clientInfo.ids || []),
            {
              type: 'driversLicense',
              number: clientInfo.driversLicenseNumber,
            },
          ];
        }
      }

      for (const [key, value] of Object.entries(clientInfo!)) {
        if (key.startsWith('s3upload-')) {
          continue;
        }

        if (FINPACE_CLIENT_DEFAULT_FIELDS.includes(key)) {
          // if it's nested default field, we need to update the nested field using lodash merge
          // example if someone adds a new beneficiary or dependent or a new id,
          // we need to merge the new beneficiary with the existing beneficiaries
          // TODO: ids, dependents, beneficiaries, socialMedia, tags

          const oldVal = client[key as keyof ClientManager];

          if (!isEqual(oldVal, value)) {
            newClient[key] = value;
          }
        } else {
          if (
            ![
              'submit',
              'source',
              'status',
              'id',
              'advisorId',
              'cognitoIdentityId',
              'cognitoUsername',
              'createdAt',
              'updatedAt',
              'firmId',
              'firmName',
              'settings',
              'isProspect',
              'isVerified',
              'firm',
              'advisor',
            ].includes(key)
          ) {
            newClient.custom[key] = value;
          }
        }
      }

      // TODO: we can also delete custom object if it's same as original client custom object

      if (template.useForOutreachDate && !client.dateOutreached) {
        newClient.dateOutreached = fDate(new Date(), 'MM/dd/yyyy');
      }

      if (template.useForOnboardingDate && !client.dateOnboarded) {
        newClient.dateOnboarded = fDate(new Date(), 'MM/dd/yyyy');
      }

      if (Object.keys(newClient).length === 1 && Object.keys(newClient.custom).length === 0) {
        return;
      }
      await updateClient(currentForm.clientId, newClient);
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
      }
    }
  };

  const handleUpdateForm = async (
    envelopeId?: string,
    continueOnFinish: boolean = true,
    isPreviewMode: boolean = false
  ) => {
    let newFormStatus: FormStatus | undefined;
    if (envelopeId && isAdvisor && !isPreviewMode) {
      newFormStatus = formStatuses.COMPLETED as FormStatus.COMPLETED;
    }
    try {
      let newForm = {
        ...(envelopeId ? { envelopeId: envelopeId } : {}),
        ...(newFormStatus ? { status: newFormStatus } : {}),
        // ...(!isPreviewMode ? { dateSent: new Date() } : {}),
      };

      const resp = await updateForm(currentForm.id, newForm);
      setCurrentForm(resp);
      if (continueOnFinish) {
        onContinue();
      }
      if (isMountedRef.current) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        enqueueSnackbar('Something went wrong updating form', { variant: 'error' });
      }
    }
  };

  const handleSendFormForReview = async (buttonId: string) => {
    try {
      const newReviewers = cloneDeep(currentForm?.reviewers);

      setCurrentLoadingButton(buttonId);

      if (!!newReviewers.length) {
        const lastReviewerIndex = newReviewers.length - 1;
        const lastReviewer = newReviewers[lastReviewerIndex];
        if (lastReviewer.id === authUser?.sub) {
          newReviewers[lastReviewerIndex] = {
            ...lastReviewer,
            dateReviewed: new Date(),
            dateSent: new Date(),
          };
        } else {
          newReviewers.push({
            id: authUser?.sub,
            name: authUser?.name,
            type: isAdvisor ? UserRole.ADVISOR : UserRole.CLIENT,
            email: authUser?.email,
            dateReviewed: new Date(),
            dateSent: new Date(),
          });
        }
      } else {
        newReviewers.push({
          id: authUser?.sub,
          name: authUser?.name,
          type: isAdvisor ? UserRole.ADVISOR : UserRole.CLIENT,
          email: authUser?.email,
          dateReviewed: new Date(),
          dateSent: new Date(),
        });
      }

      const nextReviewerRole = isAdvisor ? UserRole.CLIENT : UserRole.ADVISOR;

      let newForm: Partial<FormManager> = {
        status: formStatuses.SENT as FormStatus.SENT,
        reviewers: [...newReviewers],
        dateSent: new Date(),
        currentReviewerRole: nextReviewerRole,
        firmId: authUser?.firmId,
        ...(nextReviewerRole === UserRole.CLIENT
          ? { clientReviewedPages: {} }
          : {
              advisorReviewedPages: {},
            }),
      };
      setLoading(true);

      if (isPublic) {
        await updatePublicForm(currentForm.id, newForm);
      } else {
        await updateForm(currentForm.id, newForm);
      }
      enqueueSnackbar('Form sent for review successfully!', {
        variant: 'success',
        autoHideDuration: 8000,
      });

      setLoading(false);

      if (!isAdvisor && isPublic && template?.redirectOnComplete) {
        window.location.replace(template.redirectUrl || '');
        return;
      }
      onContinue(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCompleteForm = async (buttonId: string) => {
    setCurrentLoadingButton(buttonId);
    try {
      if (isAdvisor && submission) {
        await handleUpdateClient();
      }

      let newForm = {
        status: formStatuses.COMPLETED as FormStatus.COMPLETED,
      };
      setLoading(true);
      await updateForm(currentForm.id, newForm);
      enqueueSnackbar('Form completed successfully!', { variant: 'success' });
      setLoading(false);
      if (!isAdvisor && template?.redirectOnComplete) {
        window.location.replace(template.redirectUrl || '');
        return;
      }
      onContinue();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCompleteFormPublic = async (buttonId: string) => {
    setCurrentLoadingButton(buttonId);
    try {
      let newForm = {
        status: formStatuses.COMPLETED as FormStatus.COMPLETED,
        firmId: currentForm?.firmId,
        id: currentForm?.id,
      };
      setLoading(true);
      await updatePublicForm(currentForm.id, newForm);
      setLoading(false);
      if (!isAdvisor && template?.redirectOnComplete) {
        window.location.replace(template.redirectUrl || '');
        return;
      }
      onContinue();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSendEnvelope = async (buttonId: string) => {
    setIsPreview(false);
    setCurrentLoadingButton(buttonId);
    const snackbarId =
      signingEventType === 'docusign'
        ? enqueueSnackbar('Creating Docusign might take a while! Please be patient.', {
            persist: true,
            variant: 'info',
          })
        : '';
    setLoading(true);
    try {
      if (isAdvisor && submission) {
        await handleUpdateClient();
      }

      const newEnvelope: Partial<EnvelopeManager> = {
        ...(await prepareEnvelope(currentForm)),
        deliveryMethod: envelopeDeliveryMethods.EMAIL as EnvelopeDeliveryMethod.EMAIL,
      };
      const response = await createEnvelope(newEnvelope);
      if (response?.id) {
        enqueueSnackbar('Document was sent!', { variant: 'success' });
        await handleUpdateForm(response?.id);
        closeSnackbar(snackbarId);
      } else {
        enqueueSnackbar('Something went wrong creating envelope', { variant: 'error' });
      }
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400 && error.response.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
      setLoading(false);
      closeSnackbar(snackbarId);
      // setErrors(error.message);
    }
  };

  const handlePreview = async (buttonId: string) => {
    const snackbarId =
      signingEventType === 'docusign'
        ? enqueueSnackbar('Creating Docusign might take a while! Please be patient.', {
            persist: true,
            variant: 'info',
          })
        : '';
    setCurrentLoadingButton(buttonId);
    setLoading(true);
    try {
      setCacheForm(cloneDeep(currentForm));
      const newEnvelope: Partial<EnvelopeManager> = {
        ...(await prepareEnvelope(currentForm)),
        preview: true,
      };
      const response = await createEnvelope(newEnvelope);
      if (response?.id) {
        enqueueSnackbar('Preview document was created!', { variant: 'success' });
        await handleUpdateForm(response?.id, false, true);
        setIsPreview(true);
        setIsSignNow(false);
      } else {
        enqueueSnackbar('Something went wrong creating envelope', { variant: 'error' });
      }
      setLoading(false);
      closeSnackbar(snackbarId);
    } catch (error: any) {
      console.error('error', error);
      if (error.response && error.response.status === 400 && error.response.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      setLoading(false);
      closeSnackbar(snackbarId);
      // setErrors(error.message);
    }
  };

  const handleSignNow = async (buttonId: string) => {
    setLoading(true);
    setCurrentLoadingButton(buttonId);
    setCacheForm(cloneDeep(currentForm));
    const snackbarId =
      signingEventType === 'docusign'
        ? enqueueSnackbar('Creating Docusign might take a while! Please be patient.', {
            persist: true,
            variant: 'info',
          })
        : '';
    try {
      if (isAdvisor && submission) {
        await handleUpdateClient();
      }

      const newEnvelope: Partial<EnvelopeManager> = {
        ...(await prepareEnvelope(currentForm)),
        deliveryMethod: envelopeDeliveryMethods.EMBEDDED as EnvelopeDeliveryMethod.EMBEDDED,
      };
      const response = await createEnvelope(newEnvelope);
      if (response?.id) {
        enqueueSnackbar('Document was created!', { variant: 'success' });
        await handleUpdateForm(response?.id, false);
        setIsPreview(false);
        setIsSignNow(true);
      } else {
        enqueueSnackbar('Something went wrong creating envelope', { variant: 'error' });
      }
      closeSnackbar(snackbarId);

      setLoading(false);
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400 && error.response.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      closeSnackbar(snackbarId);
      setLoading(false);
      // setErrors(error.message);
    }
  };

  const handleAfterPreview = async (
    buttonId: string,
    id: string,
    envelopeDeliveryMethods: EnvelopeDeliveryMethod
  ) => {
    setCurrentLoadingButton(buttonId);
    setLoading(true);
    const isSign = envelopeDeliveryMethods === 'embedded';
    try {
      if (isAdvisor && submission) {
        await handleUpdateClient();
      }
      const updatedEnvelope = {
        deliveryMethod: envelopeDeliveryMethods,
      };

      await finalizeEnvelope(id, updatedEnvelope);

      if (id) {
        enqueueSnackbar(isSign ? 'Document was created!' : 'Document was sent!', {
          variant: 'success',
        });
        handleUpdateForm(id, !isSign, false);
        setIsPreview(false);
        setIsSignNow(true);
        setLoading(false);
      } else enqueueSnackbar('Something went wrong creating envelope', { variant: 'error' });
      if (isMountedRef.current) {
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400 && error.response.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    navigate.push(PATH_DASHBOARD.root);
  };

  const COMPLETE_FORM_OPTION = {
    id: formFinalizeTypes.COMPLETE_FORM as FormFinalizeType.COMPLETE_FORM,
    title:
      !isAdvisor && template?.redirectOnComplete
        ? template?.completeButtonText || 'Complete form'
        : 'Complete form',
    tooltip: !isAdvisor && template?.redirectOnComplete ? '' : 'Mark this form as completed',
    icon:
      !isAdvisor && template?.redirectOnComplete
        ? 'eva:paper-plane-fill'
        : 'eva:checkmark-circle-2-fill',
    handleClick: handleCompleteForm,
    variant: 'contained',
  };

  const COMPLETE_FORM_OPTION_PUBLIC = {
    id: formFinalizeTypes.COMPLETE_FORM as FormFinalizeType.COMPLETE_FORM,
    title:
      !isAdvisor && template?.redirectOnComplete
        ? template?.completeButtonText || 'Complete form'
        : 'Complete form',
    tooltip: !isAdvisor && template?.redirectOnComplete ? '' : 'Mark this form as completed',
    icon:
      !isAdvisor && template?.redirectOnComplete
        ? 'eva:paper-plane-fill'
        : 'eva:checkmark-circle-2-fill',
    handleClick: handleCompleteFormPublic,
    variant: 'contained',
  };

  const SEND_FOR_REVIEW_FORM_OPTION_PUBLIC_BUTTON = {
    id: formFinalizeTypes.SEND_FORM as FormFinalizeType.SEND_FORM,
    title: 'Submit',
    tooltip: '',
    icon: 'eva:paper-plane-fill',
    handleClick: handleSendFormForReview,
    variant: 'contained',
  };

  const SEND_FOR_REVIEW_FORM_OPTION = {
    id: formFinalizeTypes.SEND_FORM as FormFinalizeType.SEND_FORM,
    title: isAdvisor ? 'Send for client review' : 'Send for review to the advisor',
    tooltip: isPublic ? '' : `Send this form to the ${isAdvisor ? 'client' : 'advisor'}`,
    icon: '',
    handleClick: handleSendFormForReview,
    variant: 'outlined',
  };

  const SEND_FOR_REVIEW_FORM_OPTION_PUBLIC = {
    id: formFinalizeTypes.SEND_FORM as FormFinalizeType.SEND_FORM,
    title: 'Confused? Get help from the Advisor',
    tooltip:
      'Clicking here will send this form partially complete. The advisor will be in touch to finish this form.',
    icon: '',
    handleClick: handleSendFormForReview,
    variant: 'text',
  };

  const ENVELOPE_FINALIZE_OPTIONS = [
    ...(template?.useDocusign
      ? [
          {
            id: envelopeFinalizeTypes.PREVIEW as EnvelopeFinalizeType.PREVIEW,
            title: 'Preview',
            tooltip: 'Preview the signing experience for clients',
            icon: '',
            handleClick: handlePreview,
            variant: 'outlined',
          },
        ]
      : []),
    {
      id: envelopeFinalizeTypes.SIGN as EnvelopeFinalizeType.SIGN,
      title: 'In-person e-sign now',
      tooltip: 'Initiate an in-person signing session and update the client in any integrations',
      icon: '',
      handleClick: handleSignNow,
      variant: 'contained',
    },
    {
      id: envelopeFinalizeTypes.SEND as EnvelopeFinalizeType.SEND,
      title: 'Send to client for e-signing',
      tooltip: 'Email the final document for signing and update the client in any integrations',
      icon: '',
      handleClick: handleSendEnvelope,
      variant: 'outlined',
    },
  ];

  const allFormCompleted = Object.values(userCompletedForm).every((val) => val);

  function getFormFinalizeOptions(template: TemplateWithFieldsManager) {
    if (isPublic) {
      if (template?.signingEvent) {
        return [SEND_FOR_REVIEW_FORM_OPTION_PUBLIC_BUTTON];
      }

      if (template?.clientCanCompleteForm) {
        return [
          ...(allFormCompleted ? [COMPLETE_FORM_OPTION_PUBLIC] : []),
          SEND_FOR_REVIEW_FORM_OPTION_PUBLIC,
        ];
      }

      return [SEND_FOR_REVIEW_FORM_OPTION_PUBLIC_BUTTON];
    }

    if (isAdvisor || template?.clientCanCompleteForm) {
      if (template.signingEvent) {
        return [
          SEND_FOR_REVIEW_FORM_OPTION,
          ...(allFormCompleted ? ENVELOPE_FINALIZE_OPTIONS : []),
        ];
      } else {
        return [SEND_FOR_REVIEW_FORM_OPTION, ...(allFormCompleted ? [COMPLETE_FORM_OPTION] : [])];
      }
    } else {
      return [SEND_FOR_REVIEW_FORM_OPTION];
    }
  }

  const FINALIZE_OPTIONS: Array<{
    id: FormFinalizeType | EnvelopeFinalizeType;
    title: string;
    tooltip: string;
    icon: string;
    handleClick: (id: FormFinalizeType | EnvelopeFinalizeType) => Promise<void>;
    comingSoon?: boolean;
    variant?: string;
  }> = [
    ...getFormFinalizeOptions(template),
    ...(!isPublic
      ? [
          {
            id: formFinalizeTypes.SAVE_EXIT as FormFinalizeType.SAVE_EXIT,
            title: 'Save and exit',
            tooltip: 'Save your progress and finish this form later',
            icon: '',
            handleClick: handleSaveAndExit,
            variant: 'text',
          },
        ]
      : []),
  ];

  const goBack = async () => {
    if (cacheForm.id) {
      setLoading(true);
      const response = await updateForm(cacheForm.id, {
        ...cacheForm,
        envelopeId: '',
      });
      setIsPreview(false);
      setIsSignNow(false);
      setLoading(false);
      setCurrentForm(response);
    }
  };

  // Preview
  if (isPreview && !isSignNow && currentForm.envelopeId) {
    return (
      <PreviewSigningScreen
        envelopeId={currentForm?.envelopeId}
        handleAfterPreview={handleAfterPreview}
        currentLoadingButton={currentLoadingButton}
        loading={loading}
        goBack={goBack}
        currentForm={currentForm}
        template={template}
      />
    );
  }
  // Sign Now
  if (isSignNow && !isPreview && currentForm?.envelopeId && currentForm?.status !== 'sent') {
    return (
      <EnvelopeSigningScreen
        envelopeId={currentForm?.envelopeId}
        loading={loading}
        onComplete={onContinue}
        goBack={goBack}
        currentForm={currentForm}
        template={template}
      />
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 600 },
        mx: 'auto',
        my: {
          xs: 'auto',
          md: 10,
        },
        minHeight: '210px',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 5 }}>
          <Typography
            sx={{
              textAlign: 'center',
              mb: 3,
            }}
            variant="h4"
            gutterBottom
          >
            {!isAdvisor && template?.redirectOnComplete
              ? template?.onCompleteHeading
              : 'What would you like to do?'}
          </Typography>

          {FINALIZE_OPTIONS.map((option) => (
            <Tooltip
              key={option.id}
              title={option.comingSoon ? `Coming soon! ${option.tooltip}` : option.tooltip}
              placement="bottom"
            >
              <Box sx={{ width: '300px', margin: 'auto' }}>
                <LoadingButton
                  variant={(option.variant as 'outlined') || 'outlined'}
                  size="large"
                  startIcon={<Iconify icon={option.icon} />}
                  sx={{ my: 1, textTransform: 'none', width: '100%' }}
                  disabled={option.comingSoon || loading}
                  loading={loading && currentLoadingButton === option.id}
                  onClick={() => option.handleClick(option.id)}
                  data-test={`form-finalize-option-${option.id}`}
                >
                  {option.title}
                </LoadingButton>
              </Box>
            </Tooltip>
          ))}
        </Card>
      </Container>
    </Box>
  );
}
