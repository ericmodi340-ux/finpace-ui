// @mui
import {
  Grid,
  Container,
  Typography,
  CardHeader,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
// @types
// redux
// hooks
import useSettings from 'hooks/useSettings';
import useUser from 'hooks/useUser';
// components
import Page from 'components/Page';
// sections
// utils
// constants
import { ClientSMS } from 'sections/@dashboard/client/profile/ClientSMS';
import { ClientManager } from '../../@types/client';
import { PATH_DASHBOARD } from 'routes/paths';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

export default function ClientLandingSMS() {
  const { themeStretch } = useSettings();
  const { user } = useUser();
  const { advisor } = useSelector((state) => state.advisor);

  const currentClient = user as ClientManager;

  return (
    <Page title="SMS">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Grid container spacing={3} sx={{ ml: 0, mt: 4 }}>
          {!currentClient?.phoneNumber && (
            <Grid container spacing={3}>
              <Grid item>
                <Card>
                  <CardHeader title="Feature not available" />
                  <CardContent>
                    <Typography>Add a phone number to use this feature</Typography>
                  </CardContent>
                  <CardActions sx={{ margin: 3, mt: 0 }}>
                    <Button
                      variant="contained"
                      sx={{ textTransform: 'none' }}
                      component={RouterLink}
                      to={PATH_DASHBOARD.settings.account}
                    >
                      Go to settings
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          )}

          {currentClient?.phoneNumber && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ClientSMS
                  advisor={advisor}
                  advisorId={currentClient?.advisorId}
                  clientId={currentClient?.id}
                  clientPhone={currentClient?.phoneNumber}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Container>
    </Page>
  );
}
