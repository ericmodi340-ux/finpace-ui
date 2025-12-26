import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// @mui
import { styled } from '@mui/material/styles';
import { Dialog, Container, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'components/Iconify';
// redux
import { createTemplate } from 'redux/slices/templates';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import DragAndDropTextField from '../DragAndDropTextField';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function TemplateImportButton() {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);

  const TemplateImportSchema = Yup.object().shape({
    json: Yup.string().required('JSON is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      json: '',
    },
    validationSchema: TemplateImportSchema,
    onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        const parsedTemplate = JSON.parse(values.json);
        const { firmId, id, ...parsedTemplateOther } = parsedTemplate;

        await createTemplate(parsedTemplateOther);
        enqueueSnackbar('Template created!', { variant: 'success' });
        if (isMountedRef.current) {
          setOpen(false);
          resetForm();
          setSubmitting(false);
        }
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        if (isMountedRef.current) {
          setSubmitting(false);
          setErrors({ json: error.message });
        }
      }
    },
  });

  const { isSubmitting, handleSubmit, getFieldProps, setValues } = formik;

  return (
    <>
      <LoadingButton
        variant="outlined"
        startIcon={<Iconify icon={'eva:cloud-download-fill'} />}
        disabled={isSubmitting}
        loading={isSubmitting}
        onClick={() => setOpen(true)}
        sx={{ mt: 2 }}
      >
        Import Template
      </LoadingButton>

      <Dialog open={open} data-test="client-welcome-modal">
        <RootStyle>
          <Container
            sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RootStyle>
              <Box
                sx={{
                  flex: 1,
                  maxWidth: 480,
                  minWidth: 360,
                  margin: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '30px 0',
                }}
              >
                <FormikProvider value={formik}>
                  <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <DragAndDropTextField
                      fullWidth
                      multiline
                      rows={8}
                      label="Drag and drop or paste your JSON template"
                      setValues={setValues}
                      {...getFieldProps('json')}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        size="large"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        sx={{ display: 'block', width: '100%' }}
                      >
                        Create Template
                      </LoadingButton>
                    </Box>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <LoadingButton
                        type="button"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </LoadingButton>
                    </Box>
                  </Form>
                </FormikProvider>
              </Box>
            </RootStyle>
          </Container>
        </RootStyle>
      </Dialog>
    </>
  );
}
