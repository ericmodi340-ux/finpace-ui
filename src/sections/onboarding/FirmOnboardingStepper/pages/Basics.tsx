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
import { useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';

// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
import { FormEvent, memo, useCallback } from 'react';

// ----------------------------------------------------------------------

const initialFirm = {
  name: '',
  email: '',
};

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'name', label: 'Firm Name', type: 'TextField' },
  {
    name: 'email',
    label: 'Firm Email',
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

const FirmBasics = memo(
  ({ onContinue, setFirmName }: { onContinue: VoidFunction; setFirmName: any }) => {
    const handleChange = useCallback(
      (event: FormEvent) => {
        const input = event.target as HTMLInputElement;
        if (input.name !== 'name') return;
        const name = input.value;
        setFirmName(name);
      },
      [setFirmName]
    );

    const { authUser, user } = useUser();
    const firmAdminUser = user as FirmAdminManager;
    const {
      id: firmId,
      name: firmName,
      email: firmEmail,
    } = useSelector((state) => state.firm.firm);
    const { enqueueSnackbar } = useSnackbar();
    const isMountedRef = useIsMountedRef();

    const helpMessage = 'You can change the name later in the "Settings" section';

    const FirmBasicsSchema = Yup.object().shape({
      name: Yup.string().max(255).required('Name is required'),
      email: Yup.string()
        .email('Email must be a valid email address')
        .required('Email is required'),
      isAdvisor: Yup.boolean().required('Advisor status is required'),
    });

    const formik = useFormik({
      initialValues: {
        name: firmName || '',
        email: firmEmail || authUser?.email || '',
        isAdvisor: firmAdminUser?.isAdvisor || false,
      },
      validationSchema: FirmBasicsSchema,
      onSubmit: async (values, { resetForm, setSubmitting }) => {
        try {
          setSubmitting(true);
          const { isAdvisor, ...firmValues } = values;

          const newFirm = {
            ...initialFirm,
            ...firmValues,
          };
          await updateFirm(firmId, newFirm);
          enqueueSnackbar('Firm created successfully!', { variant: 'success' });

          if (isAdvisor) {
            const newFirmAdmin = {
              isAdvisor,
            };
            await updateFirmAdmin(authUser?.sub, newFirmAdmin);
            enqueueSnackbar('Advisor details saved!', { variant: 'success' });
          }

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
        <Form autoComplete="off" noValidate onSubmit={handleSubmit} onChange={handleChange}>
          <DialogContent sx={{ pb: 0, overflowY: 'unset' }}>
            {FIELDS.map((field) => (
              <FormField
                key={field.name}
                field={field as FormFieldManager}
                touched={touched}
                errors={errors}
                getFieldProps={getFieldProps}
                data-test={`onboarding-firm-basics-${field.name}-input`}
                helpMessage={field.name === 'name' ? helpMessage : undefined}
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
              data-test="onboarding-firm-basics-submit-button"
            >
              Continue
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
    );
  }
);

export default FirmBasics;
