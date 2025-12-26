import { useEffect, Dispatch, SetStateAction } from 'react';
import { useSnackbar } from 'notistack';
// @types
import { CompositeTemplate, FormManager } from '../../../../../@types/form';
// redux
import { createForm } from 'redux/slices/forms';
// components
import LoadingScreen from 'components/LoadingScreen';
// hooks
import useTemplate from 'hooks/useTemplate';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

export default function FormInitializer({
  currentForm,
  selectedTemplateId,
  selectedTemplates,
  setCurrentFormId,
  setCurrentForm,
  onContinue,
}: {
  currentForm: FormManager;
  selectedTemplateId: string;
  selectedTemplates: CompositeTemplate[];
  setCurrentFormId: Dispatch<SetStateAction<string>>;
  setCurrentForm: Dispatch<SetStateAction<FormManager>>;
  onContinue: VoidFunction;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const selectedTemplate = useTemplate(selectedTemplateId);

  useEffect(() => {
    const handleCreateForm = async (form: Partial<FormManager>) => {
      try {
        const response = await createForm(form);
        // repalce route to form/formid

        if (response?.id) {
          setCurrentFormId(response?.id);
          setCurrentForm((prevForm) => ({ ...prevForm, ...response }));
          window.history.replaceState(
            null,
            response?.formTitle,
            `${PATH_DASHBOARD.forms.root}/${response.id}`
          );
          onContinue();
        } else {
          enqueueSnackbar('Something went wrong', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    };

    if (
      !currentForm.id &&
      currentForm.clientId &&
      currentForm.advisorId &&
      currentForm.formTitle &&
      (currentForm.templateId || selectedTemplateId) &&
      selectedTemplate
    ) {
      handleCreateForm({
        ...currentForm,
        advisorId: currentForm.advisorId,
        templateId: currentForm.templateId || selectedTemplateId,
        compositeTemplates: selectedTemplates,
        reviewers: [],
        advisorReviewedPages: {},
        clientReviewedPages: {},
        isSigningEvent: selectedTemplate?.signingEvent,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentForm, selectedTemplateId, setCurrentFormId, enqueueSnackbar]);

  return <LoadingScreen message="Preparing your form..." />;
}
