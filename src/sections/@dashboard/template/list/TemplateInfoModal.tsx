import { Box, Grid, Typography, Dialog, DialogContent, DialogTitle } from '@mui/material';

type templateInfoModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  template: {
    id: string;
    title: string;
    description: string;
  };
};

export default function TemplateInfoModal({
  isOpen,
  handleClose,
  template,
}: templateInfoModalProps) {
  return (
    <Dialog onClose={handleClose} open={isOpen} className="use-formio">
      <Box sx={{ padding: '25px', width: '600px', height: '300px' }}>
        <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '20px' }}>
          {template.title}
        </DialogTitle>
        <DialogContent sx={{ px: 0, pt: '10rem' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Description:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {template.description}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
