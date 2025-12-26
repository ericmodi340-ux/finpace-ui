import { Dispatch, SetStateAction, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { DialogContent, DialogActions, Box, SxProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FormFieldManager } from '../../../@types/field';
// redux
import { useSelector, dispatch } from 'redux/store';

// components
import FormField from 'components/FormField';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import { capitalize } from 'lodash';
import { getTemplates } from 'redux/slices/templates';
import { IntegrationServiceId } from '../../../@types/integration';

// ----------------------------------------------------------------------

export default function TemplateAndIntegrationSelect({
  onContinue,
  setSelectedTemplateId,
  setIntegrationId,
  sx,
}: {
  onContinue: VoidFunction;
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
  setIntegrationId: Dispatch<SetStateAction<string>>;
  sx?: SxProps;
}) {
  const templates = useSelector((state) => state.templates);

  const { integrations } = useEditingIntegrations();
  const isMountedRef = useIsMountedRef();

  const templatesArray = arrayFromObj(templates.byId, templates.allIds);

  const ClientTemplateSelectSchema = Yup.object().shape({
    templateId: Yup.string().nullable().required('Form is required'),
    integrationId: Yup.string().nullable().required('Form is required'),
  });

  useEffect(() => {
    dispatch(getTemplates());
  }, []);

  const formik = useFormik({
    initialValues: {
      templateId: '',
      integrationId: '',
    },
    validationSchema: ClientTemplateSelectSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const { templateId, integrationId } = values;
        // @ts-ignore
        setSelectedTemplateId(templateId);
        setIntegrationId(integrationId);
        onContinue();
        if (isMountedRef.current) {
          resetForm();
          setSubmitting(false);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } =
    formik;

  return (
    <Box sx={{ width: { xs: '100%', md: '100%' }, margin: 'auto', minHeight: '210px', ...sx }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogContent sx={{ pb: 0, overflowY: 'unset' }}>
            <FormField
              field={
                {
                  name: 'templateId',
                  label: 'Template',
                  type: 'Autocomplete',
                  options: templatesArray.map((template) => ({
                    value: template.id,
                    label: template.title,
                  })),
                } as FormFieldManager
              }
              value={values.templateId}
              touched={touched}
              errors={errors}
              getFieldProps={getFieldProps}
              setFieldValue={setFieldValue}
              data-test="form-select-templateId-input"
              // sx={{ maxWidth: { md: '60%' }, margin: 'auto' }}
            />
            <FormField
              field={
                {
                  name: 'integrationId',
                  label: 'Integration',
                  type: 'Autocomplete',
                  options: integrations
                    .filter(
                      (item) =>
                        item.id !== IntegrationServiceId.google &&
                        item.id !== IntegrationServiceId.outlook
                    )
                    .map((integration) => ({
                      value: integration.id,
                      label: capitalize(integration.id),
                    })),
                } as FormFieldManager
              }
              value={values.integrationId}
              touched={touched}
              errors={errors}
              getFieldProps={getFieldProps}
              setFieldValue={setFieldValue}
              data-test="form-select-integration-input"
              // sx={{ maxWidth: { md: '60%' }, margin: 'auto' }}
            />
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              loadingIndicator="Loading..."
              sx={{
                flex: 1,
                minWidth: '277px',
                maxWidth: '277px',
                width: 'fit-content',
              }}
              data-test="form-template-submit-button"
            >
              Continue
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Box>
  );
}
