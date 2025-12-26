import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as Yup from 'yup';
import {
  Box,
  SxProps,
  IconButton,
  Stack,
  Typography,
  useTheme,
  alpha,
  Divider,
  Button,
  Container,
  Card,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useDispatch, useSelector } from 'redux/store';

// utils
import arrayFromObj from 'utils/arrayFromObj';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'components/hook-form/FormProvider';
import { RHFAutocomplete, RHFTextField } from 'components/hook-form';
import { getTemplates } from 'redux/slices/templates';
import { isArray, startCase } from 'lodash';
import Iconify from 'components/Iconify';
import { CompositeTemplate, FormManager } from '../../../../../@types/form';

// ----------------------------------------------------------------------

const ClientTemplateSelectSchema = Yup.object().shape({
  templateSelected: Yup.array()
    .of(
      Yup.object()
        .shape({
          templateId: Yup.string().nullable().required('Template is required'),
          signers: Yup.array().of(Yup.string()).min(1, 'Signer is required'),
        })
        .required()
    )
    .min(1, 'At least one template is required'),
  formTitle: Yup.string().required('Form title is required'),
});

export default function TemplateSelect({
  handleSetForm,
  onContinue,
  setSelectedTemplateId,
  setSelectedTemplates,
  setSendMultipleForms,
  sx,
}: {
  handleSetForm: (updateForm: Partial<FormManager>) => void;
  onContinue: VoidFunction;
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
  setSelectedTemplates: Dispatch<SetStateAction<CompositeTemplate[]>>;
  setSendMultipleForms: Dispatch<SetStateAction<boolean>>;
  sx?: SxProps;
}) {
  const templates = useSelector((state) => state.templates);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [selectedTemplateForAdd, setSelectedTemplateForAdd] = useState<string>('');

  const templatesArray = arrayFromObj(templates.byId, templates.allIds);

  const methods = useForm({
    resolver: yupResolver(ClientTemplateSelectSchema),
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore
    name: 'templateSelected',
  });

  const handleAddTemplate = () => {
    if (selectedTemplateForAdd) {
      append({ templateId: selectedTemplateForAdd, signers: [] });
      setSelectedTemplateForAdd('');
    }
  };

  const handleRemoveTemplate = (index: number) => {
    remove(index);
  };

  const onSubmit = handleSubmit((data) => {
    const { templateSelected } = data;
    if (templateSelected && isArray(templateSelected) && !!templateSelected?.length) {
      // @ts-ignore
      setSelectedTemplateId(templateSelected?.[0]?.templateId);
      setSelectedTemplates(templateSelected);
      // @ts-ignore
      handleSetForm({ formTitle: data.formTitle });
    }
    onContinue();
  });

  useEffect(() => {
    if (!templates.loaded) {
      dispatch(getTemplates());
    }
  }, [dispatch, templates.loaded]);

  const availableTemplates = templatesArray?.filter((item) => !item?.inactive) || [];

  return (
    <Box
      sx={{
        width: '100%',
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
            Choose your template(s) below
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack>
              <RHFTextField
                name="formTitle"
                label="Form Title"
                placeholder="Form Title"
                sx={{ mt: 3, mb: 1 }}
              />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <RHFAutocomplete
                  name="templateToAdd"
                  options={availableTemplates}
                  getOptionLabel={(option) => option.title || ''}
                  value={availableTemplates.find((t) => t.id === selectedTemplateForAdd) || null}
                  onChange={(_, value) => setSelectedTemplateForAdd(value?.id || '')}
                  label="Select Template"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTemplate}
                  disabled={!selectedTemplateForAdd}
                  sx={{ height: 56 }}
                >
                  Add Template
                </Button>
              </Stack>

              {fields.length > 0 && (
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Selected Templates ({fields.length})
                </Typography>
              )}

              <Stack spacing={2}>
                {fields.map((field, index) => {
                  // @ts-ignore
                  const template = availableTemplates.find((t) => t.id === field.templateId);
                  return (
                    <Card
                      key={field.id}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            {template?.title || 'Unknown Template'}
                          </Typography>
                          <RHFAutocomplete
                            name={`templateSelected.${index}.signers`}
                            multiple
                            options={['client_1', 'client_2', 'advisor', 'firm']}
                            loading={templates.isLoading}
                            getOptionLabel={(option) => startCase(option)}
                            label="Select Signers"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveTemplate(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                loadingIndicator="Loading..."
                disabled={fields.length === 0}
                sx={{
                  mt: 2,
                }}
              >
                Continue
              </LoadingButton>
              <Divider sx={{ my: 3 }} />
              <Button
                sx={{
                  textTransform: 'none',
                }}
                onClick={() => setSendMultipleForms(false)}
                variant="outlined"
              >
                Send single form instead?
              </Button>
            </Stack>
          </FormProvider>
        </Card>
      </Container>
    </Box>
  );
}
