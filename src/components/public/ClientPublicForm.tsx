import { FormFieldManager } from '../../@types/field';
import FormField from 'components/FormField';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { TemplateWithFieldsManager } from '../../@types/template';
import useReCaptcha from 'hooks/useReCaptcha';
import { createPublicForm } from 'redux/slices/forms';
import { FormManager } from '../../@types/form';
import { UserRole } from '../../@types/user';

// Define a validation schema with Yup
const validationSchema = Yup.object().shape({
  clientName: Yup.string().required('First name is required'),
  clientLastName: Yup.string().required('Last name is required'),
  clientEmail: Yup.string().email('Must be a valid email').required('Email is required'),
});

const FIELDS = [
  {
    name: 'clientName',
    label: 'First Name',
    type: 'TextField',
  },
  {
    name: 'clientLastName',
    label: 'Last Name',
    type: 'TextField',
  },
  {
    name: 'clientEmail',
    label: 'Email',
    type: 'TextField',
  },
];

function ClientPublicForm({
  handleNext,
  setForm,
  setTemplate,
  setClient,
}: {
  handleNext: VoidFunction;
  setForm: (v: FormManager) => void;
  setTemplate: (v: TemplateWithFieldsManager) => void;
  setClient: (v: any) => void;
}) {
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const firmId = searchParams.get('firmId');
  const templateId = searchParams.get('templateId');
  const advisorId = searchParams.get('advisorId');
  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  const email = searchParams.get('email');

  const navigate = useNavigate();

  const { reCaptchaLoaded, generateReCaptchaToken } = useReCaptcha();

  const formik = useFormik({
    initialValues: {
      clientName: firstName || '',
      clientLastName: lastName || '',
      clientEmail: email || '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (!firmId || !templateId || !advisorId)
          return enqueueSnackbar('Missing search params', { variant: 'error' });

        // const captcha = await generateReCaptchaToken('login');
        const response = await createPublicForm(
          {
            clientName: `${values.clientName} ${values.clientLastName}`,
            clientEmail: values.clientEmail,
            firmId,
            templateId,
            advisorId,
          },
          '123123123'
        );

        const { form, template, isDataSecureInPublicForms, redirectUrl } = response;

        if (isDataSecureInPublicForms && redirectUrl) {
          navigate(redirectUrl);
          return;
        }

        if (!form || !template)
          return enqueueSnackbar('Error creating public form', {
            variant: 'error',
          });

        enqueueSnackbar('Form was created!', { variant: 'success' });
        setForm(form);
        setClient({
          role: UserRole.CLIENT,
          sub: form?.clientId,
          name: `${values.clientName} ${values.clientLastName}` || '',
          email: values.clientEmail || '',
          firmId: form?.firmId || '',
        });
        setTemplate(template);
        handleNext();
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Something went wrong', {
          variant: 'error',
        });
      }
    },
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        {FIELDS.map((field) => (
          <FormField
            key={field.name}
            field={field as FormFieldManager}
            touched={touched}
            errors={errors}
            getFieldProps={getFieldProps}
          />
        ))}
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          disabled={!reCaptchaLoaded}
          loadingIndicator="Loading..."
          sx={{ flex: 1, width: '100%' }}
        >
          Continue
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}

export default ClientPublicForm;
