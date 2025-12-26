// @mui
import { Box, DialogTitle, DialogContent, IconButton } from '@mui/material';
// components
import BitsyFormRenderer from 'components/form/FormRenderer';
import { DialogAnimate } from 'components/animate';
import Iconify from 'components/Iconify';
// hooks
import useFullTemplate from 'hooks/useFullTemplate';
// ----------------------------------------------------------------------

type previewTemplateProps = {
  isOpen: boolean;
  onClose?: () => void;
  templateId: string;
};

export default function PreviewTemplate({ isOpen, onClose, templateId }: previewTemplateProps) {
  const { template } = useFullTemplate(templateId, true);

  return (
    <DialogAnimate
      fullScreen
      sx={{ p: 0, pt: 3, maxWidth: 'lg', width: '100%', height: '100%' }}
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle
        sx={{ pt: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        Preview {template?.title || 'template'}
        <IconButton onClick={onClose}>
          <Iconify icon={'ic:round-close'} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Box
          sx={{
            p: { xs: 0, md: 3 },
            maxWidth: 720,
            mx: 'auto',
            position: 'relative',
            minWidth: { xs: '100%', md: '453.61px' },
          }}
        >
          <BitsyFormRenderer
            components={[...(template?.fields ? template?.fields : [])]}
            onSubmit={() => {}}
            options={{
              readOnly: true,
            }}
            isLibraryTemplate={true}
          />
        </Box>
      </DialogContent>
    </DialogAnimate>
  );
}
