import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useLocation, useParams } from 'react-router';
// redux
import { updateTemplate } from 'redux/slices/templates';
// @mui
import { Box, Fab } from '@mui/material';
// @types
import { TemplateWithFieldsManager } from '../../../../../@types/template';
// components
// @ts-ignore
import BitsyFormBuilder from 'components/form/FormBuilder';
// utils
import { mapPages } from 'utils/templates';
// constants
import { initialFormFields } from 'constants/templates';

export default function FormBuilder({
  template,
  onFormUpdate,
  formUpdates,
  setSave,
}: {
  template: TemplateWithFieldsManager | undefined;
  onFormUpdate: Function;
  formUpdates: any;
  setSave: Dispatch<SetStateAction<boolean>>;
}) {
  const { templateId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  if (location.search.includes('&debug=true')) {
    console.log('formUpdates', JSON.stringify(formUpdates));
    console.log('template from backend', JSON.stringify(template));
  }

  const [formDetails, setFormDetails] = useState(template?.fields || initialFormFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) {
      const updatedTemplate = {
        ...template,
        fields: [...mapPages(formDetails)],
      };
      onFormUpdate(updatedTemplate);
    }
    // eslint-disable-next-line
  }, [formDetails]);

  useEffect(() => {
    setSave(false);
  }, [setSave]);

  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (touched && templateId && template) {
        try {
          const updatedTemplate = {
            ...template,
            fields: [...mapPages(formDetails)],
          };
          if (updatedTemplate?.fields) {
            const fieldKeys = updatedTemplate.fields.map((field) => field?.key);
            if (fieldKeys.length !== new Set(fieldKeys).size) {
              enqueueSnackbar('All Pages keys must be unique! You may have used duplicate keys', {
                variant: 'error',
              });
              return;
            }
          }
          setIsSubmitting(true);
          await updateTemplate(templateId, updatedTemplate);
          // Silently update state
          // enqueueSnackbar('Update success', { variant: 'success' });
          setTouched(false);
          onFormUpdate(null);
          setSave(true);
        } catch (e) {
          console.log(e);
          enqueueSnackbar('Oops, an error occured on autosave !', { variant: 'error' });
        } finally {
          setIsSubmitting(false);
        }
      }
    }, 30000);

    return () => {
      clearInterval(saveInterval);
    };
  }, [templateId, touched, template, formDetails, enqueueSnackbar, onFormUpdate, setSave]);

  return (
    <>
      <BitsyFormBuilder
        components={[...(formDetails ? formDetails : initialFormFields)]}
        onChange={(formData: any) => {
          setFormDetails(formData);
        }}
        onComponentUpdate={(e: any) => {
          setTouched(true);
        }}
      />

      <Box sx={{ mt: 3 }}>
        <Fab
          type="submit"
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 150,
            borderRadius: 1.5,
          }}
          disabled={isSubmitting}
          onClick={async () => {
            if (templateId) {
              try {
                const updatedTemplate = {
                  ...template,
                  fields: [...mapPages(formDetails)],
                };
                // throw an error if all field keys are not unique
                if (updatedTemplate?.fields) {
                  const fieldKeys = updatedTemplate.fields.map((field) => field?.key);
                  if (fieldKeys.length !== new Set(fieldKeys).size) {
                    enqueueSnackbar(
                      'All Pages keys must be unique! You may have used duplicate keys',
                      { variant: 'error' }
                    );
                    return;
                  }
                }
                setIsSubmitting(true);
                await updateTemplate(templateId, updatedTemplate);
                enqueueSnackbar('Update success', { variant: 'success' });
                setTouched(false);
                onFormUpdate(null);
                setSave(true);
              } catch (e) {
                console.log(e);
                enqueueSnackbar('Oops, an error occured!', { variant: 'error' });
              }
              setIsSubmitting(false);
            }
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Fab>
      </Box>
    </>
  );
}
