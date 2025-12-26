import { Button, Stack, Typography, useTheme } from '@mui/material';
import useFullTemplate from 'hooks/useFullTemplate';
import { useParams } from 'react-router';
import { FormBuilder as FormioBuilder, FormType } from '@formio/react';
import { FormBuilder as FormioBuilderType } from '@formio/js';
import { useCallback, useEffect, useRef, useState } from 'react';
import LoadingScreen from 'components/LoadingScreen';
import { useSnackbar } from 'notistack';
import { updateTemplate } from 'redux/slices/templates';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'routes/use-router';

import '../../components/form/scoped-styles.scss';

export default function FormTemplateBuilder() {
  const builderRef = useRef<FormioBuilderType | null>(null);
  const { templateId = '' } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { back } = useRouter();

  const { template: currentTemplate, loading: currentTemplateLoading } =
    useFullTemplate(templateId);

  const [temp, setTemp] = useState<any>(currentTemplate);

  useEffect(() => {
    if (currentTemplate) {
      setTemp(currentTemplate);
    }
  }, [currentTemplate]);

  const onSave = useCallback(async () => {
    const data = builderRef.current?._form;
    if (data && arePageKeysAreUnique(data)) {
      enqueueSnackbar('All Pages keys must be unique! You may have used duplicate keys', {
        variant: 'error',
      });
      return;
    }
    const newTemplate = {
      ...temp,
      fields: data?.components,
    };
    setTemp(newTemplate);
    setLoading(true);
    await updateTemplate(templateId, {
      ...temp,
      fields: data?.components,
    });
    setLoading(false);
    enqueueSnackbar('Update success', { variant: 'success' });
  }, [temp, enqueueSnackbar, templateId]);

  if (currentTemplateLoading) {
    return <LoadingScreen />;
  }

  if (!temp) {
    return;
  }

  return (
    <>
      <Stack
        sx={{
          flex: 1,
          background: (theme) => theme.palette.common.white,
          height: '100vh',
        }}
      >
        <Stack
          sx={{
            px: 3,
            height: 75,
            background: (theme) => theme.palette.common.white,
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
            <Typography variant="h5">{currentTemplate?.title}</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Button onClick={back} variant="outlined" color="primary">
              Exit
            </Button>
            <LoadingButton loading={loading} onClick={onSave} variant="contained" color="primary">
              Save Changes
            </LoadingButton>
          </Stack>
        </Stack>
        <Stack
          sx={{
            flex: 1,
            height: 'calc(100vh - 75px)',
            background: (theme) => theme.palette.background.neutral,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div className="use-bootstrap use-formio">
            <FormioBuilder
              initialForm={{
                display: 'wizard',
                components: temp?.fields || [],
              }}
              onBuilderReady={(builder) => {
                builderRef.current = builder;
              }}
            />
          </div>
        </Stack>
      </Stack>
    </>
  );
}

function arePageKeysAreUnique(data: FormType) {
  const fieldKeys = data?.components?.map((field) => field?.key);
  if (fieldKeys.length !== new Set(fieldKeys).size) {
    return true;
  }
  return false;
}
