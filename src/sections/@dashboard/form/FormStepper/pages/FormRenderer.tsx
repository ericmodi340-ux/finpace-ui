import { useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
// @mui
import { Alert, AlertColor, AlertTitle, Box, CircularProgress, Button } from '@mui/material';
// @types
import { FormManager, FormStatus, FormSubmission } from '../../../../../@types/form';
import {
  FormBuilderFieldsMapping,
  TemplateWithFieldsManager,
} from '../../../../../@types/template';
import { UserRole } from '../../../../../@types/user';
// components
// @ts-ignore
import BitsyFormRenderer from 'components/form/FormRenderer';
import LoadingScreen from 'components/LoadingScreen';
// hooks
import useForm from 'hooks/useForm';
import useUserFromStore from 'hooks/useUserFromStore';
// utils
import { fDateTime } from 'utils/formatTime';
import { prefillFieldsFromBitsy, updateFormInDb } from 'utils/forms';
// constants
import { formStatuses } from 'constants/forms';
import { roles } from 'constants/users';
import { isEmpty, cloneDeep } from 'lodash';
import { useSelector, store } from 'redux/store';
import { getStorageBlob, storagePaths } from 'redux/slices/storage';
import { AdvisorManager } from '../../../../../@types/advisor';
import { blobToBase64 } from 'utils/files';
import { Utils } from '@formio/react';

// ----------------------------------------------------------------------

export default function FormRenderer({
  formId,
  template,
  onContinue,
  isReadOnly,
  setUserCompletedForms,
  isPublic = false,
  form,
  authUser,
  orionAccountNumber,
}: {
  formId: string | undefined;
  template: TemplateWithFieldsManager | undefined | null;
  onContinue: VoidFunction;
  isReadOnly?: boolean;
  setUserCompletedForms: Dispatch<SetStateAction<Record<string, boolean>>>;
  authUser: any;
  isPublic?: boolean;
  form?: FormManager;
  orionAccountNumber?: string;
}) {
  const { firm: firmFromState } = useSelector((state) => state.firm);
  const { byId: advisorsById } = useSelector((state) => state.advisors);

  const currForm = useForm(formId) || form;
  const { isLoading } = useSelector((state) => state.forms);
  const { clientId, submission: lastSubmission } = currForm || {};

  const [initialSubmission, setInitialSubmission] = useState<FormSubmission>({} as FormSubmission);
  const [fetchingImg, setFetchingImg] = useState(false);

  const [submission, setSubmission] = useState<FormSubmission | undefined>();

  const currentClientFromStore = useUserFromStore(clientId, roles.CLIENT as UserRole.CLIENT);

  const firm = useMemo(() => firmFromState, [firmFromState]);

  const advisor = useMemo(
    () => advisorsById[currForm?.advisorId || ''] || ({} as AdvisorManager),
    [advisorsById, currForm?.advisorId]
  );

  const currentClient = useMemo(
    () => ({ ...currentClientFromStore, ...advisor?.managementFees }),
    [currentClientFromStore, advisor?.managementFees]
  );

  const currentForm = useMemo(
    () => ({ ...currForm, orionAccountNumber }) as FormManager,
    [currForm, orionAccountNumber]
  );

  const convertFilesToBase64 = useCallback(async (submission: any) => {
    const convertedSubmission = { ...submission };

    for (const key in convertedSubmission) {
      if (key.startsWith('s3upload-')) {
        const val = convertedSubmission[key];
        convertedSubmission[key] = await Promise.all(
          val.map(async (file: any) => {
            if (file.url) return file;

            const storageFile = await getStorageBlob({ path: file.s3key });

            if (storageFile) {
              const base64 = await blobToBase64(storageFile);
              return { ...file, url: base64 };
            }

            return file;
          })
        );
      }
    }

    return convertedSubmission;
  }, []);

  useEffect(() => {
    async function getInitialSubmissionData() {
      if (!template) return;
      let initialSubmissionData: FormSubmission = {
        [template.id]: {},
      } as FormSubmission;
      setFetchingImg(true);

      const templateIncludeClient1 = currentForm?.compositeTemplates
        ?.find((item, idx) => `${item.templateId}::${idx}` === template.id)
        ?.signers?.includes('client_1');

      if (lastSubmission && !!Object.keys(lastSubmission?.[template?.id] || {}).length) {
        initialSubmissionData = cloneDeep(lastSubmission);
      } else if (currentClient && template?.fields) {
        initialSubmissionData = {
          ...lastSubmission,
          [template.id]: cloneDeep({
            ...(templateIncludeClient1
              ? prefillFieldsFromBitsy(currentClient, template.fields || [])
              : {}),
            firmName: firm?.name,
            advisor: advisor,
            firm: firm,
          }),
        };
      }

      const convertedSubmission = await convertFilesToBase64(initialSubmissionData?.[template.id]);

      if (convertedSubmission && Object.keys(convertedSubmission).length) {
        setInitialSubmission((pre) => ({
          ...pre,
          [template.id]: convertedSubmission,
        }));
      }

      setFetchingImg(false);
    }

    getInitialSubmissionData();
  }, [
    advisor,
    convertFilesToBase64,
    currentClient,
    currentForm?.compositeTemplates,
    firm,
    firm?.name,
    lastSubmission,
    template,
  ]);

  const [loading, setLoading] = useState(false);

  const initialCompletedPages = useMemo(() => {
    let newArray: string[] = [];
    if (!template?.id) return {};
    if (authUser?.role === UserRole.CLIENT) {
      newArray = currentForm?.clientReviewedPages?.[template.id]?.slice(1) || [];
    } else {
      newArray = currentForm?.advisorReviewedPages?.[template.id]?.slice(1) || [];
    }

    return newArray?.reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );
  }, [
    authUser?.role,
    currentForm?.advisorReviewedPages,
    currentForm?.clientReviewedPages,
    template?.id,
  ]);

  // // Programmatically click next button when first rerender has been done - form.io bug
  // useEffect(() => {
  //   if (firstRerenderDone) {
  //     setLoading(true);
  //     setTimeout(() => {
  //       const nextButton = document.querySelector('.formio-form button.btn-wizard-nav-next');
  //       simulateMouseClick(nextButton);
  //       setLoading(false);
  //     }, 1500);
  //   }
  // }, [firstRerenderDone]);

  if (!currentClient && !isPublic) {
    return <LoadingScreen />;
  }

  if ((!currentClient || !template) && isLoading) {
    return <LoadingScreen />;
  }

  if (!currentForm || !template) {
    return (
      <>
        <Alert severity="warning" sx={{ textAlign: 'left', my: 3 }}>
          <AlertTitle>Form not found</AlertTitle>We couldn't find this form.
          <br />
          Please try again and contact Finpace if the problem persists.
        </Alert>
      </>
    );
  }

  const handleSave = async ({
    submission,
    pageId,
    skip,
  }: {
    submission: Record<string, any>;
    pageId: string;
    skip: boolean;
  }) => {
    setSubmission(submission);

    try {
      setLoading(true);
      await updateFormInDb({
        schema: submission,
        currentForm,
        user: authUser,
        templateId: template.id,
        // formio conditional fields don't work with when initial values are refreshed
        shouldUpdateState: skip,
        isPublic,
      });
      setLoading(false);
      if (skip) {
        onContinue();
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handlePageChange = async (
    currentPageKey: string,
    submission: FormSubmission,
    next: () => void
  ) => {
    if (isReadOnly) {
      next();
      return;
    }
    setSubmission(submission);
    try {
      setLoading(true);
      await updateFormInDb({
        schema: submission,
        page: currentPageKey,
        templateId: template.id,
        currentForm,
        user: authUser,
        isPublic,
      });
      next();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
    // // ? Rerender the form once to prevent form.io from overwriting submission data (form.io bug)
    // if (!firstRerenderDone) {
    //   setFirstRerenderDone(true);
    // }
    // Scroll to top on page change
    const dialogWindow = document.querySelectorAll(
      '#form-edit-dialog > .MuiDialog-container > .MuiPaper-root'
    )[0];
    if (dialogWindow) {
      const stepperTab = dialogWindow.querySelector('.stepper-tab');
      setTimeout(() => {
        const stepperTabPosition = stepperTab?.getBoundingClientRect()?.top || 0;
        if (stepperTabPosition < 0) {
          stepperTab?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const handleFormFinish = async (
    currentPageKey: string,
    submission: FormSubmission,
    next: () => void
  ) => {
    if (isReadOnly) {
      next();
      return;
    }
    setSubmission(submission);
    try {
      setLoading(true);
      await updateFormInDb({
        schema: submission,
        page: currentPageKey,
        templateId: template.id,
        currentForm,
        user: authUser,
        isPublic,
      });
      setLoading(false);
      onContinue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportToPdf = async () => {
    const { exportToPdf } = await import('utils/formio-to-pdf');
    const advisorIconPath = storagePaths.advisorIcon(firm.id, currentForm?.advisorId);
    const advisorLogo = await getStorageBlob({
      path: advisorIconPath,
    });

    let logoBase64: string = '';
    if (advisorLogo) {
      logoBase64 = (await blobToBase64(advisorLogo)) as string;
    }

    if (!advisorLogo) {
      const firmLogoPath = storagePaths.firmIcon(firm.id);
      const firmLogo = await getStorageBlob({
        path: firmLogoPath,
      });
      if (firmLogo) {
        logoBase64 = (await blobToBase64(firmLogo)) as string;
      }
    }

    exportToPdf(template.fields, initialSubmission[template.id], {
      title: template.title || '',
      advisorName: store.getState().advisors.byId[currentForm?.advisorId]?.name || '',
      firmName: firm.name || '',
      clientName: store.getState().clients.byId[currentForm?.clientId]?.name || '',
      createdAt: fDateTime(currentForm.createdAt),
      firmLogoBase64: logoBase64,
    });
  };

  const generateFormComponents = () => {
    let components: FormBuilderFieldsMapping[] = [];

    if (!!template.fields.length) {
      components = template.fields;
    }

    // Hide components not for client
    const isClient = roles.CLIENT === authUser?.role;
    if (isClient) {
      const clonedComponents = cloneDeep(components);

      Utils.eachComponent(
        clonedComponents,
        (component: any, path: any, parent: any) => {
          if (!isEmpty(component.properties?.onlyAdvisor)) {
            if (Array.isArray(parent)) {
              const index = parent.indexOf(component);
              if (index !== -1) {
                parent.splice(index, 1);
              }
            } else if (parent && parent.components) {
              const index = parent.components.indexOf(component);
              if (index !== -1) {
                parent.components.splice(index, 1);
              }
            }
          }
        },
        true // Include nested components
      );

      return clonedComponents;
    }
    return components;
  };

  const statusAlerts: {
    [key in FormStatus]: { title: string; message: string; severity: string };
  } = {
    [formStatuses.CANCELLED as FormStatus.CANCELLED]: {
      title: 'This form has been cancelled.',
      message: `This form was cancelled${
        currentForm?.dateCancelled ? ` on ${fDateTime(currentForm?.dateCancelled)}` : ''
      }${
        currentForm?.cancelReason ? ` for the following reason: ${currentForm?.cancelReason}` : ''
      }.`,
      severity: 'error',
    },
    [formStatuses.COMPLETED as FormStatus.COMPLETED]: {
      title: 'This form has been completed.',
      message: `This form was reviewed by all reviewers${
        currentForm?.dateCompleted ? ` on ${fDateTime(currentForm?.dateCompleted)}` : ''
      }.`,
      severity: 'success',
    },
    [formStatuses.DRAFT as FormStatus.DRAFT]: {
      title: 'This form is a draft.',
      message: `This form has not been sent for review yet.`,
      severity: 'info',
    },
    [formStatuses.SENT as FormStatus.SENT]: {
      title: 'This form has been sent.',
      message: `This form is currently in the review process.`,
      severity: 'warning',
    },
  };
  const statusAlert = isReadOnly ? statusAlerts[currentForm?.status] : null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      {statusAlert && (
        <Alert severity={statusAlert.severity as AlertColor} sx={{ textAlign: 'left' }}>
          <AlertTitle>{statusAlert.title}</AlertTitle>
          {statusAlert.message}
        </Alert>
      )}

      <BitsyFormRenderer
        templateId={template.id}
        templateName={template.title || ''}
        components={generateFormComponents()}
        submission={cloneDeep(submission || initialSubmission[template.id])}
        onNextPage={handlePageChange}
        onSubmit={handleFormFinish}
        options={{
          readOnly: isReadOnly,
          isPublic,
        }}
        isComplete={currentForm?.status === 'completed'}
        handleSave={handleSave}
        initialCompletedPages={initialCompletedPages}
        isLibraryTemplate={false}
        setUserCompletedForms={setUserCompletedForms}
      />

      {isReadOnly && (
        <Button variant="contained" onClick={handleExportToPdf}>
          Export to PDF
        </Button>
      )}

      {(loading || fetchingImg) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.4)',
            zIndex: 999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
