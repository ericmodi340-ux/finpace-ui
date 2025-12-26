import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { DialogContent, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FormFieldManager } from '../../../../../@types/field';
import { ClientManager } from '../../../../../@types/client';
// redux
import { useSelector } from 'redux/store';
// components
import FormField from 'components/FormField';
// hooks
import useAuth from 'hooks/useAuth';
import useIsMountedRef from 'hooks/useIsMountedRef';
// utils
import arrayFromObj from 'utils/arrayFromObj';
// constants
import { roles, statuses } from 'constants/users';

// ----------------------------------------------------------------------

export default function AdvisorSelect({
  onContinue,
  handleSetClient,
}: {
  onContinue: VoidFunction;
  handleSetClient: (updateClient: Partial<ClientManager>) => void;
}) {
  const { user } = useAuth();
  const advisors = useSelector((state) => state.advisors);
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const advisorsArray = arrayFromObj(advisors.byId, advisors.allIds);

  const ClientAdvisorSelectSchema = Yup.object().shape({
    advisorId: Yup.string().nullable().required('Advisor is required'),
  });

  const formik = useFormik({
    initialValues: {
      advisorId: user?.role === roles.ADVISOR ? user.sub : '', // TODO: [DEV-224] Prefill with advisorId if firm admin is advisor
    },
    validationSchema: ClientAdvisorSelectSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const { advisorId } = values;
        const updateClient = { advisorId } as Partial<ClientManager>;
        handleSetClient(updateClient);
        enqueueSnackbar('Advisor select success', { variant: 'success' });
        onContinue();
        if (isMountedRef.current) {
          resetForm();
          setSubmitting(false);
        }
      } catch (error) {
        console.error(error);
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } =
    formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogContent sx={{ pb: 0, overflowY: 'unset' }}>
          <FormField
            field={
              {
                name: 'advisorId',
                label: 'Advisor',
                type: 'Autocomplete',
                options: advisorsArray.flatMap((advisor) => {
                  if (
                    !advisor.isVerified ||
                    !advisor.status ||
                    advisor.status === statuses.INACTIVE
                  ) {
                    return [];
                  }
                  return [
                    {
                      value: advisor.id,
                      label: `${advisor.name} (${advisor.email})`,
                    },
                  ];
                }),
              } as FormFieldManager
            }
            value={values.advisorId}
            touched={touched}
            errors={errors}
            getFieldProps={getFieldProps}
            setFieldValue={setFieldValue}
            data-test={`new-client-form-select-advisorId-input`}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            loadingIndicator="Loading..."
            sx={{ flex: 1 }}
            data-test="new-client-advisor-submit-button"
          >
            Continue
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
