import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { updateTemplate } from 'redux/slices/templates';
import { Typography, Button, Dialog, DialogProps, Stack } from '@mui/material';
import { TemplateWithFieldsManager } from '../../../../../@types/template';
import { LoadingButton } from '@mui/lab';
import { DASHBOARD_NAVBAR_WIDTH } from 'config';
import { PDFViewer } from 'sections/@dashboard/signing-modal/pdf-viewer';

type Props = DialogProps & {
  template: TemplateWithFieldsManager | undefined;
  onClose: () => void;
  setTemplate: (template: any) => void;
};

export default function PdfFormBuilderWrapper({ template, onClose, setTemplate, ...other }: Props) {
  const { templateId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [formDetails, setFormDetails] = useState(template?.pdfFormSchema);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSave = useCallback(async () => {
    if (templateId) {
      try {
        if (!formDetails.settings.pdf) return;

        const updatedTemplate = {
          ...template,
          pdfFormSchema: formDetails,
        };
        setIsSubmitting(true);
        await updateTemplate(templateId, updatedTemplate);
        setTemplate(updatedTemplate);
        enqueueSnackbar('Template saved successfully!', {
          variant: 'success',
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'top',
          },
        });
      } catch (e) {
        console.log(e);
        enqueueSnackbar('Oops, an error occured!', { variant: 'error' });
      }
      setIsSubmitting(false);
    }
  }, [enqueueSnackbar, formDetails, setTemplate, template, templateId]);

  const handleLoadSuccess = (pages: number) => {
    setNumPages(pages);
    // Adjust scale based on container width
    const container = document.querySelector('.pdf-container');
    if (container) {
      const newScale = container.clientWidth / 613;
      setScale(Math.max(newScale, 1));
    }
  };

  return (
    <Dialog disableEnforceFocus fullScreen onClose={onClose} {...other}>
      <Stack
        sx={{
          flex: 1,
          background: (theme) => theme.palette.background.neutral,
        }}
      >
        <Stack
          sx={{
            py: 3,
            px: 5,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            background: (theme) => theme.palette.background.paper,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">{template?.title}</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>

            <LoadingButton variant="contained" loading={isSubmitting} onClick={onSave}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          sx={{
            flexGrow: 1,
          }}
        >
          <Stack
            sx={{
              width: DASHBOARD_NAVBAR_WIDTH,
              background: (theme) => theme.palette.background.paper,
              height: '100%',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            Test
          </Stack>
          <Stack
            sx={{
              width: `calc(100% - ${DASHBOARD_NAVBAR_WIDTH}px)`,
            }}
          >
            <Stack
              sx={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: (theme) => theme.palette.background.neutral,
                overflow: 'auto',
                my: 3,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <Stack
                className="pdf-container"
                sx={{
                  width: 1091,
                }}
              >
                <PDFViewer
                  url="https://dev-cdn.finpace.com/public/firms/2a12159d-d50b-4f07-a651-ab501f1ce094/envelopes/ce0f3330-812a-4420-b5dc-6903770a0443/pdfs/document-1733338643825.pdf"
                  onLoadSuccess={handleLoadSuccess}
                  onLoadError={() => console.error('error')}
                  numPages={numPages}
                  scale={scale}
                >
                  <Stack />
                </PDFViewer>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Dialog>
  );
}
