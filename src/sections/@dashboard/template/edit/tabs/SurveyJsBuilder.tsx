import { Button, Stack, Typography, IconButton, useTheme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-core/survey-core.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import { CDN_PATH, MAIN_HEADER_MOBILE } from 'config';
import Iconify from 'components/Iconify';
import { TemplateWithFieldsManager } from '../../../../../@types/template';
import { updateTemplate } from 'redux/slices/templates';
import surveyJsTheme from './surveyjstheme';
import { createStorageItem } from 'redux/slices/storage';
import { getImagePath } from 'utils/storage';
import { useSelector } from 'redux/store';
import { roles } from 'constants/users';
import { UserRole } from '../../../../../@types/user';
import { useSnackbar } from 'notistack';

export default function SurveyjsBuilder({
  template,
  onCloseBuilder,
}: {
  template?: TemplateWithFieldsManager;
  onCloseBuilder: () => void;
}) {
  const [creator, setCreator] = useState<SurveyCreator | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useSelector((state) => state.user);

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  // Initialize creator only once
  useEffect(() => {
    const newCreator = new SurveyCreator({
      pageEditMode: 'bypage',
      showJSONEditorTab: true,
      allowZoom: true,
    });

    newCreator.toolbox.forceCompact = true;

    newCreator.text = JSON.stringify(
      template?.surveryJsTemplateSchema || {
        showTitle: false,
        showCompletePage: false,
        questionErrorLocation: 'bottom',
        progressBarLocation: 'aboveheader',
        showTOC: true,
        widthMode: 'static',
        width: '704',
      }
    );

    newCreator.applyTheme(surveyJsTheme(theme));

    // Apply our custom Material Design theme
    newCreator.applyCreatorTheme(surveyJsTheme(theme));

    // Add custom file upload handler
    newCreator.onUploadFile.add(async (_, options) => {
      try {
        const file = options.files[0];
        if (!file || !user?.id || !template?.id) {
          options.callback('error', 'Missing required parameters');
          return;
        }

        // Create storage path using the utility function
        const imagePath = getImagePath({
          userType: roles.ADVISOR as UserRole.ADVISOR,
          userId: user.id,
          imageType: 'surveyjs-images',
        });

        // Generate unique filename with timestamp
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${template.id}_${timestamp}.${fileExtension}`;
        const storagePath = `${imagePath}/${uniqueFilename}`;

        // Upload file to storage
        const response = await createStorageItem({
          path: storagePath,
          file: file,
          isPublic: true,
          contentType: file.type,
        });

        if (response.key) {
          // Get the public URL for the uploaded file
          const fileUrl = `${CDN_PATH}${response.key}`;
          options.callback('success', fileUrl);
        } else {
          options.callback('error', 'Failed to upload file');
        }
      } catch (error) {
        console.error('Upload error:', error);
        options.callback('error', 'Upload failed');
      }
    });

    setCreator(newCreator);

    return () => {
      // Cleanup creator on unmount
      newCreator.dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, user?.id]);

  // Update creator text when template changes
  useEffect(() => {
    if (creator && template) {
      creator.text = JSON.stringify(template.surveryJsTemplateSchema || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const banner = document.querySelector('.svc-creator__banner');
          if (banner) {
            banner.remove();
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const onSave = useCallback(async () => {
    if (!creator) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedTemplate = {
        ...template,
        surveryJsTemplateSchema: creator.JSON || {},
      };
      if (template?.id) {
        await updateTemplate(template?.id, updatedTemplate);
        setSaveSuccess(true);
        // Hide success state after 2 seconds
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      enqueueSnackbar('Failed to save template', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator, enqueueSnackbar, template]);

  return (
    <Stack height="100vh">
      <Stack
        sx={{
          height: MAIN_HEADER_MOBILE,
          px: 3,
          backgroundColor: (theme) => theme.palette.primary.darker,
          color: (theme) => theme.palette.primary.contrastText,
        }}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h5">{template?.title}</Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={onCloseBuilder} disabled={isSaving}>
            <Iconify icon="mdi:close" />
          </IconButton>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={!creator || isSaving || saveSuccess}
            startIcon={
              isSaving ? (
                <Iconify icon="eos-icons:loading" />
              ) : saveSuccess ? (
                <Iconify icon="mdi:check" />
              ) : null
            }
            sx={{
              width: 150,
              backgroundColor: (theme) =>
                saveSuccess ? theme.palette.success.main : theme.palette.primary.main,
              color: (theme) => theme.palette.primary.contrastText,
              ':hover': {
                backgroundColor: (theme) =>
                  saveSuccess ? theme.palette.success.dark : theme.palette.primary.dark,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
          </Button>
        </Stack>
      </Stack>
      {creator && <SurveyCreatorComponent creator={creator} />}
    </Stack>
  );
}
