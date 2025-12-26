import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { DialogContent, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { FormFieldManager } from '../../../../@types/field';
// components
import FormField from 'components/FormField';
// redux
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

const initialFirmAdmin = {
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
  {
    name: 'isAdvisor',
    label: 'Are you also an advisor?',
    type: 'Select',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function FirmAdminBasics({ onContinue }: { onContinue: VoidFunction }) {
  const { authUser, user } = useUser();
  const firmAdminUser = user as FirmAdminManager;
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const FirmAdminBasicsSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    isAdvisor: Yup.boolean().required('Advisor status is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      isAdvisor: firmAdminUser?.isAdvisor || false,
    },
    validationSchema: FirmAdminBasicsSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const newFirmAdmin = {
          ...initialFirmAdmin,
          ...values,
        };
        await updateFirmAdmin(authUser?.sub, newFirmAdmin);
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
              data-test={`onboarding-firm-admin-basics-${field.name}-input`}
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
            data-test="onboarding-firm-admin-basics-submit-button"
          >
            Continue
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
