import {
  Button,
  Card,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { EmailTemplateWithAllFields } from '../../../../@types/engagementHub';
import LogoIcon from 'components/LogoIcon';
import { LoadingButton } from '@mui/lab';
import { mjmlToJson, useEditorContext } from '';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import { useEffect, useState } from 'react';
import { useBoolean } from 'hooks/useBoolean';
import Iconify from 'components/Iconify';
import ConfirmDialog from 'components/ConfirmDialog';
import Scrollbar from 'components/Scrollbar';
import { EditorCore } from '';
import mjml2html from 'mjml-browser';
import { BasicEmailTemplate } from '';

export default function EmailTemplateHeader({
  emailTemplate,
  loading,
  onSave,
}: {
  emailTemplate: EmailTemplateWithAllFields;
  loading: boolean;
  onSave: (values: BasicEmailTemplate) => Promise<void>;
}) {
  const [mjml, setMjml] = useState('');
  const [html, setHtml] = useState('');
  const { submit, reset, values } = useEditorContext();
  const [isLoading, setLoading] = useState(false);

  const openCode = useBoolean();

  const navigate = useNavigate();

  useEffect(() => {
    if (emailTemplate?.json?.content) {
      reset({
        content: emailTemplate?.json?.content,
        subject: emailTemplate?.subject || '',
      });
    }
  }, [emailTemplate?.json?.content, emailTemplate?.subject, reset]);

  const onImportMJML = async () => {
    const json = mjmlToJson(mjml);

    reset({
      subject: 'New Email',
      content: json,
    });
    openCode.onFalse();
  };

  const sendEmail = async () => {
    setLoading(true);
    await onSave(values);
    setLoading(false);
    navigate(
      PATH_DASHBOARD.engagementHub.emailTemplateSend +
        '?selectedId=' +
        emailTemplate.emailTemplateId
    );
  };

  return (
    <Card
      sx={{
        height: 60,
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        color: (theme) => theme.palette.getContrastText(theme.palette.background.paper),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="h5">{emailTemplate?.name}</Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={3}>
        <Tooltip title="Edit Mjml">
          <span>
            <IconButton
              sx={{
                color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
              }}
              onClick={() => {
                const mjmlData = EditorCore.toMJML({
                  element: values.content,
                  beautify: true,
                  mode: 'production',
                });
                setMjml(mjmlData);
                // @ts-ignore
                const newmjml = mjmlData?.replaceAll(
                  '<mj-divider></mj-divider>',
                  '<mj-raw><div style="break-before: page;"></div></mj-raw>'
                );
                const { html } = mjml2html(newmjml, {});
                setHtml(html);
                openCode.onTrue();
              }}
            >
              <Iconify icon="mdi:code" />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          onClick={() => navigate(PATH_DASHBOARD.engagementHub.emailTemplates)}
        >
          Exit
        </Button>
        <LoadingButton loading={isLoading} variant="outlined" onClick={sendEmail}>
          Send
        </LoadingButton>
        <LoadingButton loading={loading} variant="contained" onClick={submit}>
          Save Template
        </LoadingButton>
      </Stack>
      {openCode.value && (
        <ConfirmDialog
          open={openCode.value}
          onClose={openCode.onFalse}
          title="Edit Mjml"
          maxWidth="lg"
          content={
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h5">Mjml</Typography>
                <Scrollbar>
                  <TextField
                    value={mjml}
                    onChange={(e) => setMjml(e.target.value)}
                    multiline
                    inputProps={{ style: { height: 366, fontSize: 18, color: '#ffffff' } }}
                    style={{
                      width: '100%',
                      height: 400,
                      overflowY: 'scroll',
                      backgroundColor: '#283142',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  />
                </Scrollbar>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5">Html</Typography>
                <Scrollbar>
                  <TextField
                    value={html}
                    disabled
                    multiline
                    inputProps={{ style: { height: 366, fontSize: 18, color: '#ffffff' } }}
                    style={{
                      width: '100%',
                      height: 400,
                      overflowY: 'scroll',
                      backgroundColor: '#283142',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  />
                </Scrollbar>
              </Grid>
            </Grid>
          }
          action={
            <LoadingButton
              variant="contained"
              size="medium"
              onClick={onImportMJML}
              sx={{
                width: 150,
              }}
            >
              Save
            </LoadingButton>
          }
        />
      )}
    </Card>
  );
}
