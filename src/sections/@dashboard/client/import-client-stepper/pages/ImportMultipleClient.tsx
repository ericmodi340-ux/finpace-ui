import { LoadingButton } from '@mui/lab';
import { IntegrationOwner, IntegrationServiceId } from '../../../../../@types/integration';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'components/hook-form';
import FormProvider from 'components/hook-form/FormProvider';
import { RHFUploadBox } from 'components/hook-form/RHFUploadBox';
import { services } from 'constants/integrations';
import { statuses } from 'constants/users';
import useIntegrations from 'hooks/useIntegrations';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getServiceName } from 'utils/integrations';
import useClientTags from 'hooks/useClientTags';
import { createAutomation } from 'redux/slices/automations';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Chip, Grid, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createStorageItem } from 'redux/slices/storage';
import { NewAutomationConfig } from '../../../../../@types/automation';

const FormSchema = Yup.object().shape({
  integration: Yup.string().required('Please select a source').nullable(),
  clientType: Yup.string().required('Please select a client type').nullable(),
  file: Yup.mixed<any>().nullable(),
  tags: Yup.array().of(Yup.string()),
  frequencyType: Yup.number().nullable(),
  frequency: Yup.number()
    .nullable()
    .when('frequencyType', (frequencyType, schema) => {
      if (frequencyType === 111) {
        return schema.min(1, 'Frequency must be greater than 0').nullable().required('Required');
      }
    }),
});

export default function ImportMultipleClient(props: {
  onContinue: VoidFunction;
  handleSetOption: (updateOption: any) => void;
  currentOptions: any;
  isProspect?: boolean;
}) {
  const { integrations } = useIntegrations();

  const { enqueueSnackbar } = useSnackbar();

  const clientTags = useClientTags();
  const integrationsOptions = integrations.flatMap((integration) => {
    const service = services.find((service) => service.id === integration.id);
    if (!service?.isAvailable || integration.status === statuses.INACTIVE || !integration.fields)
      return [];
    if (service.id === 'wealthbox' || service.id === 'redtail')
      return `${integration.id}+-+${integration.integrationOwner}`;
    return [];
  });

  const defaultValues = useMemo(
    () => ({
      integration: '',
      file: '',
      tags: [],
      frequencyType: 0,
      frequency: 1,
      clientType: 'client',
    }),
    []
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        // @ts-ignore
        setValue('file', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload: NewAutomationConfig;

      if (data.integration === 'csv') {
        const s3path = await createStorageItem({
          // @ts-ignore
          file: data.file,
          // @ts-ignore
          path: `automations/${props?.currentOptions?.advisorId}/${Date.now()}-${data.file?.name}`,
        });

        payload = {
          advisorId: props?.currentOptions?.advisorId,
          subtype: 'csv',
          csvPath: s3path.key,
          type: 'import',
          clientType: data.clientType,
          tags: data.tags,
        };
      } else {
        payload = {
          advisorId: props?.currentOptions?.advisorId,
          clientType: data.clientType,
          subtype: 'integration',
          integration: String(data.integration).split('+-+')[0] as IntegrationServiceId,
          integrationOwner: String(data.integration).split('+-+')[1] as IntegrationOwner,
          type: 'import',
          frequency: data?.frequencyType === 111 ? data.frequency : data?.frequencyType,
          tags: data.tags,
        };
      }

      await createAutomation(payload);

      props?.handleSetOption({ ...props?.currentOptions, automation: true });
      props?.onContinue();
      enqueueSnackbar('Automation created successfully', { variant: 'success' });
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods}>
      <Grid
        sx={{
          mt: 0,
        }}
        container
        spacing={3}
      >
        <Grid item xs={12}>
          <RHFAutocomplete
            options={[...integrationsOptions, 'csv']}
            name="integration"
            label="Select Source"
            getOptionLabel={(option) => {
              if (option === 'csv') {
                return 'Upload CSV';
              }

              const name = getServiceName(option.split('+-+')[0] as IntegrationServiceId);

              return name ? `${name} (${option.split('+-+')[1]})` : '';
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <RHFSelect label="Import as" name="clientType">
            <MenuItem value="client">Clients</MenuItem>
            <MenuItem value="prospect">Prospects</MenuItem>
          </RHFSelect>
        </Grid>
        {watch('integration') === 'csv' && (
          <Grid item xs={12}>
            <RHFUploadBox
              sx={{ width: '100%', height: 56 }}
              name="file"
              onDrop={handleDrop}
              accept={{ 'text/csv': ['.csv'] }}
              onRemove={() => setValue('file', '')}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <RHFAutocomplete
            name="tags"
            label="Tags"
            multiple
            options={clientTags}
            freeSolo
            freeSoloCreate
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={`${option}`} size="small" label={option} />
              ))
            }
          />
        </Grid>
        {watch('integration') && watch('integration') !== 'csv' && (
          <>
            <Grid item xs={12} md={watch('frequencyType') === 111 ? 6 : 12}>
              <RHFSelect label="Frequency" name="frequencyType">
                <MenuItem value={0}>Once</MenuItem>
                <MenuItem value={24}>Daily</MenuItem>
                <MenuItem value={168}>Weekly</MenuItem>
                <MenuItem value={111}>Custom</MenuItem>
              </RHFSelect>
            </Grid>
            {watch('frequencyType') === 111 && (
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="frequency"
                  label="After Every"
                  type="number"
                  inputProps={{ min: 1 }}
                  InputProps={{ endAdornment: <>Hour</> }}
                />
              </Grid>
            )}
          </>
        )}

        <Grid item xs={12}>
          <LoadingButton
            type="submit"
            variant="contained"
            onClick={onSubmit}
            loading={isSubmitting}
            size="large"
            loadingIndicator="Loading..."
            sx={{ flex: 1, width: '100%' }}
            data-test="new-client-advisor-submit-button"
          >
            Continue
          </LoadingButton>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
