// @mui
import {
  Box,
  CardMedia,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
// @types
import { IntegrationService } from '../../../../@types/integration';
// sections
import {
  CalendarForm,
  DocusignForm,
  LaserAppForm,
  RedtailForm,
  SalesforceEnrollmentButton,
  SchwabEnrollmentButton,
  WealthboxForm,
  GoogleForm,
  OutlookForm,
} from './forms';
// hooks
import useSettings from 'hooks/useSettings';
// constants
import { serviceIds } from 'constants/integrations';
import FidelityForm from './forms/FidelityForm';
import ZapierForm from './forms/ZapierForm';

// ----------------------------------------------------------------------

interface Props {
  openModal: boolean;
  handleClose: () => void;
  service: IntegrationService;
  isAdvisorTab: boolean;
}

// ----------------------------------------------------------------------

export default function IntegrationModal({ openModal, service, handleClose, isAdvisorTab }: Props) {
  const { themeMode } = useSettings();

  const SERVICE_FORMS = {
    [serviceIds.CALENDAR]: <CalendarForm successEvent={handleClose} />,
    [serviceIds.DOCUSIGN]: <DocusignForm successEvent={handleClose} />,
    [serviceIds.REDTAIL]: <RedtailForm successEvent={handleClose} />,
    [serviceIds.SALESFORCE]: <SalesforceEnrollmentButton successEvent={handleClose} />,
    [serviceIds.SCHWAB]: <SchwabEnrollmentButton successEvent={handleClose} />,
    [serviceIds.WEALTHBOX]: <WealthboxForm successEvent={handleClose} />,
    [serviceIds.FIDELITY]: <FidelityForm successEvent={handleClose} />,
    [serviceIds.GOOGLE]: <GoogleForm successEvent={handleClose} />,
    [serviceIds.OUTLOOK]: <OutlookForm successEvent={handleClose} />,
    [serviceIds.LASERAPP]: <LaserAppForm successEvent={handleClose} isAdvisorTab={isAdvisorTab} />,
    [serviceIds.ZAPIER]: <ZapierForm />,
  };

  return (
    <Dialog onClose={handleClose} open={openModal}>
      <Box sx={{ padding: '25px', width: '450px' }}>
        <Grid
          item
          xs={3}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <CardMedia
            component="img"
            image={themeMode === 'dark' ? service?.imageWhite : service?.image}
            alt={service?.name}
            sx={{ maxWidth: '60%', top: 0, objectFit: 'contain' }}
          />
        </Grid>
        <DialogTitle style={{ textAlign: 'center' }}>
          Integrate with {service?.name || 'this service'}
        </DialogTitle>
        <DialogContent style={{ paddingTop: '25px' }}>
          {SERVICE_FORMS[service.id] || (
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Coming soon!
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            justifyContent: 'center',
          }}
        >
          <Button onClick={handleClose}>Go back</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
