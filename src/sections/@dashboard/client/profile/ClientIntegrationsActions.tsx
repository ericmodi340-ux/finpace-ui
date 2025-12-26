import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Typography, Grid, Link, CardMedia, Card } from '@mui/material';
import { PATH_DASHBOARD } from 'routes/paths';
// @types
import { AdvisorManager } from '../../../../@types/advisor';
import { ClientManager } from '../../../../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../../../../@types/integration';
import { UserRole } from '../../../../@types/user';
// sections
import PushClientToSchwabButton from 'sections/@dashboard/integrations/third-parties/schwab/PushClientButton';
import LaserAppPushClientButton from 'sections/@dashboard/integrations/third-parties/laserapp/PushClientButton';
import SchwabDigitalAccountOpenButton from 'sections/@dashboard/integrations/third-parties/schwab/DigitalAccountOpenButton';
// hooks
import useIntegrations from 'hooks/useIntegrations';
import useUserFromStore from 'hooks/useUserFromStore';
// constants
import { serviceIds, services } from 'constants/integrations';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type Props = {
  clientId: string;
};

export default function ClientIntegrationsActions({ clientId }: Props) {
  const client = useUserFromStore(clientId, roles.CLIENT as UserRole.CLIENT) as ClientManager;
  const advisor = useUserFromStore(
    client?.advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;
  const { integrations, showBothIntegrationOwners } = useIntegrations();

  const SERVICE_ACTIONS: {
    [key in IntegrationServiceId]?: (props: { [key: string]: any }) => ReactNode;
  } = {
    // [serviceIds.REDTAIL as IntegrationServiceId.REDTAIL]: ({
    //   integrationOwner,
    // }: {
    //   integrationOwner?: IntegrationOwner;
    // }) => (
    //   <>
    //     <PushClientToRedtailButton
    //       client={client}
    //       integrationOwner={integrationOwner}
    //       showIntegrationOwner={showBothIntegrationOwners}
    //     />
    //   </>
    // ),
    [serviceIds.LASERAPP as IntegrationServiceId.LASERAPP]: ({
      integrationOwner,
    }: {
      integrationOwner?: IntegrationOwner;
    }) => (
      <LaserAppPushClientButton
        client={client}
        integrationOwner={integrationOwner}
        showIntegrationOwner={showBothIntegrationOwners}
      />
    ),
    // [serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE]: ({
    //   integrationOwner,
    // }: {
    //   integrationOwner?: IntegrationOwner;
    // }) => (
    //   <>
    //     <PushClientToSalesforceButton
    //       client={client}
    //       integrationOwner={integrationOwner}
    //       showIntegrationOwner={showBothIntegrationOwners}
    //     />
    //   </>
    // ),
    [serviceIds.SCHWAB as IntegrationServiceId.SCHWAB]: ({
      integrationOwner,
    }: {
      integrationOwner?: IntegrationOwner;
    }) => (
      <>
        <PushClientToSchwabButton
          client={client}
          integrationOwner={integrationOwner}
          showIntegrationOwner={showBothIntegrationOwners}
        />
        <SchwabDigitalAccountOpenButton
          client={client}
          advisor={advisor}
          integrationOwner={integrationOwner}
        />
      </>
    ),
    // [serviceIds.WEALTHBOX as IntegrationServiceId.WEALTHBOX]: ({
    //   integrationOwner,
    // }: {
    //   integrationOwner?: IntegrationOwner;
    // }) => (
    //   <>
    //     <PushClientToWealthboxButton
    //       client={client}
    //       integrationOwner={integrationOwner}
    //       showIntegrationOwner={showBothIntegrationOwners}
    //     />
    //   </>
    // ),
  };

  const integrationsWithActions = integrations.flatMap((integration) => {
    const service = services.find((service) => service.id === integration.id);

    if (!service || (service && !SERVICE_ACTIONS[service.id])) {
      return [];
    }

    return integration;
  });

  if (!integrations.length || !integrationsWithActions.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          No integrated services with actions were found.{' '}
          <Link component={RouterLink} to={PATH_DASHBOARD.general.integrations}>
            Add one now
          </Link>
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {integrationsWithActions
        .sort((a, b) => {
          if (a.id === b.id) {
            if (a.integrationOwner === b.integrationOwner) {
              return 0;
            }
            return a.integrationOwner > b.integrationOwner ? 1 : -1;
          }
          return a.id > b.id ? 1 : -1;
        })
        .flatMap((integration) => {
          const service = services.find((service) => service.id === integration.id);

          if (!service || !service.isAvailable) {
            return [];
          }

          const { integrationOwner } = integration;

          if (service.id === 'laserapp' && integrationOwner === 'firm') {
            return [];
          }

          return (
            <Grid item xs={12} sm={6} lg={4} key={`${integrationOwner}__${service.id}`}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignContent: 'space-between',
                  textAlign: 'center',
                  height: '100%',
                  p: 3,
                }}
              >
                <CardMedia
                  component="img"
                  alt={service.name}
                  image={service.image}
                  sx={{
                    objectFit: 'contain',
                    height: { xs: '60px', md: '70px' },
                    p: 1,
                  }}
                />
                {SERVICE_ACTIONS[service.id]?.({ integrationOwner })}
              </Card>
            </Grid>
          );
        })}
    </Grid>
  );
}
