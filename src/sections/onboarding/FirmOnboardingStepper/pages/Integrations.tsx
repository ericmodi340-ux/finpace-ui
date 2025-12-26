// @mui
import { Box } from '@mui/material';
// constants
import { additionalFirmServices, services } from 'constants/integrations';
// sections
import IntegrationsList from 'sections/@dashboard/integrations/third-parties/List';

// ----------------------------------------------------------------------

export default function Integrations() {
  const firmServices = [...services, ...additionalFirmServices];

  return (
    <Box
      sx={{
        left: '50%',
        mt: 3,
        mb: 3,
        position: 'relative',
        transform: 'translateX(-50%)',
        width: '80vw',
      }}
    >
      <Box
        sx={{
          maxWidth: '960px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <IntegrationsList list={firmServices} />
      </Box>
    </Box>
  );
}
