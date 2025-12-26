import { useSnackbar } from 'notistack';
// @mui
import { Typography, Card, Stack, Chip } from '@mui/material';
// redux
import * as Yup from 'yup';
// hooks
import { useSelector } from 'redux/store';
import { RHFAutocomplete } from 'components/hook-form';
import FormProvider from 'components/hook-form/FormProvider';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { FirmManager } from '../../../../@types/firm';
import { updateFirm } from 'redux/slices/firm';
import { useEffect } from 'react';

export const CalendarSettingsSchema = Yup.object().shape({
  type: Yup.array().of(Yup.string()),
  category: Yup.array().of(Yup.string()),
});

export default function CalendarSettings() {
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);

  const initialValues = {
    customTypes: firm.settings?.calendar?.customTypes || [],
    customCategories: firm.settings?.calendar?.customCategories || [],
  };

  const methods = useForm({
    resolver: yupResolver(CalendarSettingsSchema) as any,
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    setValue('customCategories', firm.settings?.calendar?.customCategories || []);
    setValue('customTypes', firm.settings?.calendar?.customTypes || []);
  }, [firm, setValue]);

  const onSubmit = async (values: any) => {
    try {
      const newFirmSettings: Partial<FirmManager> = {
        settings: {
          ...(firm.settings || {}),
          calendar: {
            url: firm.settings?.calendar?.url || '',
            customTypes: values.customTypes,
            customCategories: values.customCategories,
          },
        },
      };
      await updateFirm(firm.id, newFirmSettings);
      enqueueSnackbar('Calendar settings saved!', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save calendar settings', { variant: 'error' });
    }
  };

  return (
    <Card sx={{ m: 1, p: 3 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} alignItems="flex-end" direction="row">
          <Stack spacing={2} sx={{ width: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Add Custom Categories
            </Typography>
            <RHFAutocomplete
              name="customCategories"
              label="Custom Categories"
              multiple
              sx={{ mt: 5 }}
              options={[]}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={`${option}firstInvestor`}
                    size="small"
                    label={option}
                  />
                ))
              }
            />
          </Stack>
          <Stack spacing={2} sx={{ width: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Add Custom Event Types
            </Typography>
            <RHFAutocomplete
              name="customTypes"
              label="Custom Types"
              multiple
              sx={{ mt: 5 }}
              options={firm?.settings?.calendar?.customTypes || []}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={`${option}firstInvestor`}
                    size="small"
                    label={option}
                  />
                ))
              }
            />
          </Stack>
        </Stack>
        <Stack mt={3}>
          <LoadingButton
            sx={{
              ml: 'auto',
            }}
            type="submit"
            loading={isSubmitting}
            variant="contained"
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Card>
  );
}
