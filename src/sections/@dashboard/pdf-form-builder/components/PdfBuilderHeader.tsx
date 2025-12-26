import { LoadingButton } from '@mui/lab';
import { Button, Stack, Typography } from '@mui/material';
import { TemplateWithFieldsManager } from '../../../../@types/template';
import { DASHBOARD_HEADER_DESKTOP } from 'config';
import React from 'react';

export default function PdfBuilderHeader({
  template,
  onClose,
  onSave,
}: {
  template: TemplateWithFieldsManager;
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSaveHandler = async () => {
    setIsSubmitting(true);
    await onSave();
    setIsSubmitting(false);
  };

  return (
    <Stack
      sx={{
        py: 3,
        px: 5,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        height: DASHBOARD_HEADER_DESKTOP,
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

        <LoadingButton variant="contained" loading={isSubmitting} onClick={onSaveHandler}>
          Save Changes
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
