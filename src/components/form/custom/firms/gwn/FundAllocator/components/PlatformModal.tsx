// @mui
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  Typography,
} from '@mui/material';
// @types
import { Platform } from '../_@types';
// sections
import ModelListItem from './ModelListItem';
// utils
import { useContext } from 'react';
import { FundAllocatorContext } from '../FundAllocator';

// ----------------------------------------------------------------------

type Props = {
  platform: Platform;
  openModal: boolean;
  handleClose: () => void;
};

// ----------------------------------------------------------------------

export default function PlatformModal({ platform, openModal, handleClose }: Props) {
  const { remainingFundsPercent, platformAllocationMap } = useContext(FundAllocatorContext);
  const models = Object.values(platformAllocationMap[platform.name]);

  return (
    <Dialog onClose={handleClose} open={openModal} fullWidth={true} maxWidth={'md'}>
      <Box sx={{ padding: '25px' }}>
        <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Allocate models at
          <br />
          {platform.name}
        </DialogTitle>
        <DialogContent sx={{ px: 0, pt: '25px' }}>
          <List>
            {models.map((model) => (
              <ModelListItem key={model.id} platformName={platform.name} model={model} />
            ))}
          </List>
        </DialogContent>
        <DialogActions
          sx={{
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={handleClose} sx={{ minWidth: '277px' }}>
              Next
            </Button>
            <Typography
              variant="body1"
              color={remainingFundsPercent < 0 ? 'error' : 'text.secondary'}
              sx={{ fontStyle: 'italic', py: '30px' }}
            >
              {remainingFundsPercent}% remaining
            </Typography>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
