import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { DialogContent, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { AdvisorManager } from '../../../../../@types/advisor';
import { ClientManager } from '../../../../../@types/client';
import { FormFieldManager } from '../../../../../@types/field';
import { UserRole } from '../../../../../@types/user';
// components
import FormField from 'components/FormField';
// redux
import { createClient } from 'redux/slices/clients';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUserFromStore from 'hooks/useUserFromStore';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const FIELDS = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'TextField',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'TextField',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'TextField',
  },
  {
    name: 'isProspect',
    label: 'Type',
    type: 'Select',
    options: [
      { value: true, label: 'Prospect' },
      { value: false, label: 'Client' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function ClientBasics({
  onContinue,
  currentClient,
  handleSetClient,
  isProspect = false,
}: {
  onContinue: VoidFunction;
  currentClient: ClientManager;
  handleSetClient: (updateClient: Partial<ClientManager>) => void;
  isProspect?: boolean;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const advisor = useUserFromStore(
    currentClient?.advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;

  const ClientBasicsSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    firstName: Yup.string()
      .max(30, 'First name cannot be more than 30 characters')
      .required('Name is required'),
    lastName: Yup.string()
      .max(30, 'Last name cannot be more than 30 characters')
      .required('Last name is required'),
    isProspect: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: currentClient,
    validationSchema: ClientBasicsSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const newClient = {
          ...currentClient,
          ...values,
          name:
            !values.firstName && !values.lastName ? '' : `${values.firstName} ${values.lastName}`,
          ...(isProspect ? { isProspect: true } : {}),
          sender: {
            name: advisor?.name,
          },
        };
        const response = await createClient(newClient as Partial<ClientManager>);
        if (response?.id) {
          handleSetClient(response as Partial<ClientManager>);
          enqueueSnackbar(`${isProspect ? 'Prospect' : 'Client'} was created!`, {
            variant: 'success',
          });
          onContinue();
          if (isMountedRef.current) {
            resetForm();
            setSubmitting(false);
          }
        } else {
          enqueueSnackbar('Something went wrong', { variant: 'error' });
        }
      } catch (error: any) {
        console.error(error);

        if (error.response?.status === 409) {
          // TODO: [DEV-523] Show button to client profile in snackbar if 409
          enqueueSnackbar(
            'This user already exists. Please go to their profile via the clients or prospects list.',
            { variant: 'error' }
          );
        } else {
          enqueueSnackbar('Something went wrong', { variant: 'error' });
        }

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
              data-test={`new-client-basics-${field.name}-input`}
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
            data-test="new-client-basics-submit-button"
          >
            Continue
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
