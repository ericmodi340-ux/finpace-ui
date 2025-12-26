import { Box, Card, CardContent, Typography, alpha, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Iconify from './Iconify';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

function AutomationHubWidget() {
  return (
    <Card>
      <Box
        sx={{
          position: 'relative',
          height: 230,
          backgroundColor: (theme) => alpha(theme.palette.primary.dark, 0.85),
          backgroundImage: `url(/assets/background/automation_bg.webp)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <CardContent
          sx={{
            maxWidth: '80%',
            height: '100%',
            color: 'common.white',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography noWrap variant="h5">
            Automation Hub
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
            See how your business is performing with our automated reports
          </Typography>
          <Box
            sx={{
              mt: 'auto',
              width: 'fit-content',
            }}
          >
            <Button
              endIcon={<Iconify icon="ep:right" />}
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={PATH_DASHBOARD.automation.root}
            >
              See Summary
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}

export default AutomationHubWidget;
