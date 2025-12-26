import { Dispatch, SetStateAction, useEffect } from 'react';
import * as Yup from 'yup';
import { Box, SxProps, Typography, Container, Card, Stack, Divider, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useDispatch, useSelector } from 'redux/store';

// utils
import arrayFromObj from 'utils/arrayFromObj';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'components/hook-form/FormProvider';
import { RHFAutocomplete } from 'components/hook-form';
import { getTemplates } from 'redux/slices/templates';
import { CompositeTemplate } from '../../../../../@types/form';

// ----------------------------------------------------------------------

export default function TemplateSelect({
  onContinue,
  selectedTemplateId,
  setSelectedTemplateId,
  setSelectedTemplates,
  setSendMultipleForms,
  sx,
}: {
  onContinue: VoidFunction;
  selectedTemplateId: string;
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
  sx?: SxProps;
  setSelectedTemplates: Dispatch<SetStateAction<CompositeTemplate[]>>;
  setSendMultipleForms: Dispatch<SetStateAction<boolean>>;
}) {
  const templates = useSelector((state) => state.templates);

  const dispatch = useDispatch();

  const templatesArray = arrayFromObj(templates.byId, templates.allIds);

  const ClientTemplateSelectSchema = Yup.object().shape({
    templateSelected: Yup.string().nullable().required('Please select a template'),
  });

  const methods = useForm({
    defaultValues: {
      templateSelected: selectedTemplateId || '',
    },
    // @ts-ignore
    resolver: yupResolver(ClientTemplateSelectSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit((data) => {
    const { templateSelected } = data;
    setSelectedTemplates([
      {
        templateId: templateSelected as unknown as string,
        signers: ['client_1', 'client_2', 'advisor', 'firm'],
      },
    ]);
    setSelectedTemplateId(templateSelected as unknown as string);

    onContinue();
  });

  useEffect(() => {
    if (!templates.loaded) {
      dispatch(getTemplates());
    }
  }, [dispatch, templates.loaded]);

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '100%' },
        mx: 'auto',
        my: {
          xs: 'auto',
          md: 10,
        },
        ...sx,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 5 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
            }}
          >
            Choose your template below
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack
              sx={{
                mt: 2,
              }}
            >
              <RHFAutocomplete
                name="templateSelected"
                label="Template"
                options={templatesArray
                  ?.filter((item) => !item?.inactive)
                  .map((template) => template.id)}
                loading={templates.isLoading}
                getOptionLabel={(option) => templates.byId[option]?.title || ''}
              />

              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                onClick={onSubmit}
                loadingIndicator="Loading..."
                sx={{
                  mt: 3,
                }}
              >
                Continue
              </LoadingButton>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Want to send multiple templates?{' '}
              </Typography>

              <Button
                sx={{
                  mt: 1,
                }}
                variant="outlined"
                onClick={() => setSendMultipleForms(true)}
              >
                Yes, send multiple templates
              </Button>
            </Stack>
          </FormProvider>
        </Card>
      </Container>
    </Box>
  );
}
