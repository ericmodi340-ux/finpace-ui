import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { DialogContent, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FormFieldManager } from '../../../../@types/field';
// components
import FormField from 'components/FormField';
// redux
import { updateAdvisor } from 'redux/slices/advisors';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

const initialAdvisor = {
  name: '',
  email: '',
};

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'name', label: 'Your Name', type: 'TextField' },
  {
    name: 'email',
    label: 'Your Email',
    type: 'TextField',
  },
];

// ----------------------------------------------------------------------

export default function AdvisorBasics({ onContinue }: { onContinue: VoidFunction }) {
  const { authUser, user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const AdvisorBasicsSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validationSchema: AdvisorBasicsSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const newAdvisor = {
          ...initialAdvisor,
          ...values,
        };
        await updateAdvisor(authUser?.sub, newAdvisor);
        enqueueSnackbar('Information saved!', { variant: 'success' });
        onContinue();
        if (isMountedRef.current) {
          resetForm();
          setSubmitting(false);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogContent sx={{ pb: 0, overflowY: 'unset' }}>
          {FIELDS.map((field) => (
            <FormField
              key={field.name}
              field={field as FormFieldManager}
              touched={touched}
              errors={errors}
              getFieldProps={getFieldProps}
              data-test={`onboarding-advisor-basics-${field.name}-input`}
              disabled={field.name === 'email'}
            />
          ))}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            loadingIndicator="Loading..."
            sx={{ flex: 1 }}
            data-test="onboarding-advisor-basics-submit-button"
          >
            Continue
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
