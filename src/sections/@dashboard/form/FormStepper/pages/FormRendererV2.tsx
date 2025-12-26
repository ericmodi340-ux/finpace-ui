import { FormManager } from '../../../../../@types/form';
import { TemplateWithFieldsManager } from '../../../../../@types/template';
import { Model, Survey } from 'survey-react-ui';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useUserFromStore from 'hooks/useUserFromStore';
import { UserRole } from '../../../../../@types/user';
import { roles } from 'constants/users';
import useForm from 'hooks/useForm';
import { useSelector } from 'redux/store';
import { AdvisorManager } from '../../../../../@types/advisor';
import { cloneDeep } from 'lodash';
import {
  filterObjectBySet,
  flattenObject,
  unflattenObject,
  updateFormInDb,
  prefillCustomFieldsFromPreviousFormsV2,
} from 'utils/forms';
import 'survey-core/survey-core.css';
import {
  Box,
  useTheme,
  Backdrop,
  CircularProgress,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { useSnackbar } from 'notistack';
import surveyJsTheme from '../../../template/edit/tabs/surveyjstheme';
import './surveyjs.css';

const getFirmUsableFields = (firm: any) => ({
  custodian: firm?.custodian || '',
  schwabServiceTeam: firm?.schwabServiceTeam || '',
  tamp: {
    firmName: firm?.tamp?.firmName || '',
    masterAccountNumber: firm?.tamp?.masterAccountNumber || '',
  },
  name: firm?.name || '',
  id: firm?.id || '',
  email: firm?.email || '',
});

const getAdvisorUsableFields = (advisor: AdvisorManager) => ({
  id: advisor?.id || '',
  name: advisor?.name || '',
  email: advisor?.email || '',
  phoneNumber: advisor?.phoneNumber || '',
  firmId: advisor?.firmId || '',
  managementFees: advisor?.managementFees || {},
  crd: advisor?.crd || '',
  masterAccountNumber: advisor?.masterAccountNumber || '',
});

export default function FormRendererV2({
  formId,
  template,
  onContinue,
  setUserCompletedForms,
  isPublic = false,
  form,
  authUser,
  orionAccountNumber,
  isReadOnly,
}: {
  formId: string | undefined;
  template: TemplateWithFieldsManager | undefined | null;
  onContinue: VoidFunction;
  setUserCompletedForms: Dispatch<SetStateAction<Record<string, boolean>>>;
  authUser: any;
  isPublic?: boolean;
  form?: FormManager;
  orionAccountNumber?: string;
  isReadOnly?: boolean;
}) {
  const { byId: advisorsById } = useSelector((state) => state.advisors);
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(false);

  const [initialSubmission, setInitialSubmission] = useState<Record<string, any>>({});
  const surveyRef = useRef<HTMLDivElement>(null);

  const currForm = useForm(formId) || form;
  const { clientId, submission: lastSubmission } = currForm || {};

  const currentClientFromStore = useUserFromStore(clientId, roles.CLIENT as UserRole.CLIENT);

  const advisor = useMemo(
    () => advisorsById[currForm?.advisorId || ''] || ({} as AdvisorManager),
    [currForm?.advisorId, advisorsById]
  );

  const currentClient = useMemo(
    () => ({ ...currentClientFromStore, ...advisor?.managementFees }),
    [currentClientFromStore, advisor?.managementFees]
  );

  const currentForm = useMemo(
    () => ({ ...currForm, orionAccountNumber }) as FormManager,
    [currForm, orionAccountNumber]
  );

  // Helper function to prepare survey data with page number
  const prepareSurveyData = (survey: any) => {
    const { data } = survey;
    data.pageNo = survey.currentPageNo;
    return data;
  };

  // Helper function to update form in database
  const updateFormData = useCallback(
    async (data: any, shouldUpdateState: boolean = true) =>
      updateFormInDb({
        schema: unflattenObject(data),
        currentForm,
        user: authUser,
        templateId: template?.id || '',
        shouldUpdateState,
        isPublic,
      }),
    [currentForm, authUser, template?.id, isPublic]
  );

  // Helper function to mark template as completed
  const markTemplateCompleted = (completed: boolean) => {
    if (template?.id) {
      setUserCompletedForms((pre) => ({ ...pre, [template?.id]: completed }));
    }
  };

  // Handler for sending to client/advisor for completion
  const handleSendForCompletion = async () => {
    if (isReadOnly) return;
    const data = prepareSurveyData(survey);
    await updateFormData(data);
    markTemplateCompleted(false);
    onContinue();
  };

  const handleFormSubmit = async (survey: any) => {
    if (isReadOnly) return;
    setLoading(true);
    const data = prepareSurveyData(survey);
    await updateFormData(data);
    setLoading(false);
    markTemplateCompleted(true);
    onContinue();
  };

  const survey = useMemo(() => {
    const surveyInstance = new Model(template?.surveryJsTemplateSchema || {});

    surveyInstance.applyTheme(surveyJsTheme(theme));

    surveyInstance.readOnly = isReadOnly || false;

    surveyInstance.fitToContainer = true;
    surveyInstance.onComplete.add(handleFormSubmit);

    return surveyInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for saving draft
  const handleSaveDraft = useCallback(async () => {
    if (isReadOnly) return;
    try {
      const data = prepareSurveyData(survey);
      await updateFormData(data, false);
      enqueueSnackbar('Draft saved', {
        variant: 'success',
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    } catch (err) {
      console.error('Failed to save draft', err);
      enqueueSnackbar('Failed to save draft', { variant: 'error' });
    }
  }, [survey, isReadOnly, enqueueSnackbar, updateFormData]);

  useEffect(() => {
    async function getInitialSubmissionData() {
      if (!template) return;

      let initialSubmissionData = {
        [template.id]: {},
      };

      const templateIncludesClient = currentForm?.compositeTemplates
        ?.find((item, idx) => `${item.templateId}::${idx}` === template.id)
        ?.signers?.includes('client_1');

      // Check if we have existing submission data for this template
      if (lastSubmission && !!Object.keys(lastSubmission?.[template?.id] || {}).length) {
        initialSubmissionData = cloneDeep(lastSubmission);
      } else if (currentClient && template?.fields) {
        const questionsKeys = survey.getAllQuestions().map((q) => q.name);

        // Get custom field values from previous forms in the stepper
        // This enables cross-template custom field sharing for composite templates
        const customFieldsFromPreviousForms = prefillCustomFieldsFromPreviousFormsV2(
          lastSubmission,
          template.surveryJsTemplateSchema || {},
          template.id
        );

        // Create client data object if template includes client
        const clientData = templateIncludesClient
          ? {
              clientName: currentClient?.name,
              clientEmail: currentClient?.email,
            }
          : {};

        // Create initial data with firm and advisor info
        initialSubmissionData = {
          ...lastSubmission,
          [template.id]: cloneDeep({
            ...filterObjectBySet(
              {
                ...currentClient,
                ...currentClient?.custom,
              },
              new Set(questionsKeys)
            ),
            ...clientData,
            // Override with custom fields from previous forms
            ...customFieldsFromPreviousForms,
            firmName: firm?.name,
            advisor: getAdvisorUsableFields(advisor),
            firm: getFirmUsableFields(firm),
          }),
        };
      }

      setInitialSubmission(initialSubmissionData);
    }

    getInitialSubmissionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisor, currentClient, firm, firm?.name, lastSubmission]);

  const initS = useMemo(
    () => (template?.id ? flattenObject(initialSubmission?.[template?.id]) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialSubmission]
  );

  // Only merge initial data into the survey when the initial flattened data changes.
  // Avoid merging on every render so that users' in-progress answers are not overwritten
  // by the initial state when actions like saving a draft cause re-renders.
  useEffect(() => {
    if (!survey) return;
    const flattened = flattenObject(initS || {});
    if (!flattened || Object.keys(flattened).length === 0) return;
    // @ts-ignore
    survey.mergeData(flattened);
  }, [survey, initS]);

  // Create actions array for action buttons
  const speedDialActions = [
    ...(!isPublic && !isReadOnly
      ? [
          {
            icon: <Iconify icon="eva:save-fill" width={18} height={18} />,
            name: 'Save Draft',
            onClick: handleSaveDraft,
          },
        ]
      : []),
    ...(!isReadOnly
      ? [
          {
            icon: <Iconify icon="eva:paper-plane-fill" width={18} height={18} />,
            name: `Send to ${authUser?.role === roles.FIRM_ADMIN || authUser?.role === roles.ADVISOR ? 'Client' : 'Advisor'}`,
            onClick: handleSendForCompletion,
          },
        ]
      : []),
  ];

  return (
    <>
      <Box
        ref={surveyRef}
        sx={{
          // flex: 1,
          width: '100%',
          position: 'relative',
          height: {
            xs: '100vh',
            md: 'calc(100vh - 95px)',
          },
        }}
      >
        <Survey model={survey} />

        {/* Always Visible Action Buttons */}
        {!isReadOnly && speedDialActions.length > 0 && (
          <Stack
            spacing={1}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            {speedDialActions.map((action, index) => (
              <Button
                key={index}
                variant="outlined"
                color="primary"
                onClick={action.onClick}
                startIcon={action.icon}
                sx={{
                  borderRadius: 4,
                  paddingX: 2,
                  paddingY: 1.5,
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  boxShadow: (theme: any) => theme.customShadows?.z4,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: 'background.paper',
                  borderWidth: 1.5,
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: (theme: any) => theme.customShadows?.z8,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {action.name}
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {/* Loading Overlay */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" component="div">
          Form Submitting...
        </Typography>
      </Backdrop>
    </>
  );
}
