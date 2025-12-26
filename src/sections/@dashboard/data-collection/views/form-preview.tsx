import { Model, Survey } from 'survey-react-ui';
import { ThreeDimensionalLight, ThreeDimensionalDark } from 'survey-core/themes';
import useSettings from 'hooks/useSettings';
// import 'survey-core/defaultV2.min.css';
import { Button, Divider, IconButton, Stack, useTheme } from '@mui/material';
import Iconify from 'components/Iconify';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import surveyJsTheme from '../../template/edit/tabs/surveyjstheme';

const surveyJson = {
  completedHtml:
    '<div style="max-width:688px;text-align:center;margin:16px auto;">\n\n<div style="padding:0 24px;">\n<h4>Thank you.</h4>\n<p>Your message has been sent successfully.</p>\n</div>\n\n</div>\n\n',
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'panel',
          name: 'issue-report',
          width: '100%',
          elements: [
            {
              type: 'text',
              name: 'issue-title',
              width: '100%',
              minWidth: 'auto',
              title: 'Title',
            },
            {
              type: 'comment',
              name: 'issue-details',
              width: '100%',
              minWidth: 'auto',
              title: 'Details',
              maxLength: 512,
              rows: 6,
              placeholder:
                'Introduce the problem and expand on what you put in the title. Describe what you tried, what you expected to happen, and what actually resulted.',
              autoGrow: true,
              allowResize: false,
            },
            {
              type: 'rating',
              name: 'issue-priority',
              title: 'Level of priority',
              autoGenerate: false,
              rateCount: 3,
              rateValues: [
                {
                  value: 1,
                  text: 'Low',
                },
                {
                  value: 2,
                  text: 'Medium',
                },
                {
                  value: 3,
                  text: 'High',
                },
              ],
            },
            {
              type: 'file',
              name: 'attached-files',
              title: 'Attachments',
              allowMultiple: true,
              filePlaceholder: 'Click the button below to select files to upload.',
            },
            {
              type: 'text',
              name: 'email',
              width: '100%',
              minWidth: 'auto',
              title: 'Email address',
            },
          ],
        },
      ],
    },
  ],
  showQuestionNumbers: 'off',
  questionDescriptionLocation: 'underInput',
  questionErrorLocation: 'bottom',
  completeText: 'Submit',
  widthMode: 'static',
  width: '720',
};

export default function FormPreview() {
  const survey = new Model(surveyJson);
  const { themeMode } = useSettings();
  const theme = useTheme();
  const navigate = useNavigate();

  // Apply both built-in theme and our custom Material Design theme
  if (themeMode === 'light') {
    survey.applyTheme(ThreeDimensionalLight);
  } else {
    survey.applyTheme(ThreeDimensionalDark);
  }

  // Apply our custom Material Design theme for consistency
  survey.applyTheme(surveyJsTheme(theme));

  return (
    <Stack>
      <Stack
        sx={{
          backgroundColor: (theme) => theme.palette.primary.darker,
          color: (theme) => theme.palette.primary.contrastText,
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 9,
        }}
        spacing={1}
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        <IconButton
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
          }}
          onClick={() => navigate(PATH_DASHBOARD.dataCollection.forms)}
        >
          <Iconify icon="eva:arrow-back-fill" />
        </IconButton>
        <Button
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
          }}
          startIcon={<Iconify icon="mdi:edit" />}
          onClick={() => navigate(PATH_DASHBOARD.dataCollection.formBuilder('123'))}
        >
          Edit Form
        </Button>
        <Button
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
          }}
          startIcon={<Iconify icon="mdi:send" />}
        >
          Send Form
        </Button>
      </Stack>
      <Survey model={survey} />
    </Stack>
  );
}
