import { Button, Card, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { mjmlToJson, useEditorContext } from '';
import { useEffect, useState } from 'react';
import { useBoolean } from 'hooks/useBoolean';
import Iconify from 'components/Iconify';
import ConfirmDialog from 'components/ConfirmDialog';
import Scrollbar from 'components/Scrollbar';
import { EditorCore } from '';

export default function DocubuildHeader({
  loading,
  content,
  title,
  onClose,
}: {
  loading: boolean;
  content: any;
  title: string;
  onClose: any;
}) {
  const [mjml, setMjml] = useState('');
  const { submit, reset, values } = useEditorContext();

  const openCode = useBoolean();

  useEffect(() => {
    if (content) {
      reset({
        content: content?.content,
        subject: title,
      });
    }
  }, [content, reset, title]);

  const onImportMJML = async () => {
    const json = mjmlToJson(mjml);

    reset({
      subject: title,
      content: json,
    });
    openCode.onFalse();
  };

  return (
    <Card
      sx={{
        height: 60,
        backgroundColor: (theme) => theme.palette.primary.darker,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        color: (theme) => theme.palette.getContrastText(theme.palette.primary.darker),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="h5">{title}</Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={3}>
        <Tooltip title="Edit Mjml">
          <span>
            <IconButton
              sx={{
                color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
              }}
              onClick={() => {
                setMjml(
                  EditorCore.toMJML({
                    element: values.content,
                    beautify: true,
                    mode: 'production',
                  })
                );

                openCode.onTrue();
              }}
            >
              <Iconify icon="mdi:code" />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
          }}
          onClick={onClose}
        >
          Exit
        </Button>
        <LoadingButton
          sx={{
            color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
            backgroundColor: (theme) => theme.palette.primary.main,
          }}
          variant="contained"
          loading={loading}
          onClick={submit}
        >
          Save Template
        </LoadingButton>
      </Stack>
      {openCode.value && (
        <ConfirmDialog
          open={openCode.value}
          onClose={openCode.onFalse}
          title="Edit Mjml"
          maxWidth="sm"
          content={
            <Stack>
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
            </Stack>
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
