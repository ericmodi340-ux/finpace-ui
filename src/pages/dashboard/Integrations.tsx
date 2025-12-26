import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Typography,
  DialogActions,
  Stack,
} from '@mui/material';
// @types
import { FirmAdminManager } from '../../@types/firmAdmin';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Iconify from 'components/Iconify';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import Page from 'components/Page';
// sections
import CRMFieldMapper from 'sections/@dashboard/integrations/CRMFieldMapper';
import IntegrationsList from 'sections/@dashboard/integrations/third-parties/List';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
// constants
import {
  additionalFirmServices,
  additionalAdvisorServices,
  services,
} from 'constants/integrations';
import { roles } from 'constants/users';
import Tip from 'components/Tip';
import TemplateAndIntegrationSelect from 'sections/@dashboard/integrations/TemplateAndIntegrationSelect';
import { useSnackbar } from 'notistack';
import { startCase } from 'lodash';
import { useSearchParams } from 'react-router-dom';

export default function Integrations() {
  const { authUser, user } = useUser();
  const firmAdminUser = authUser?.role === roles.FIRM_ADMIN ? (user as FirmAdminManager) : null;
  const { type: editingIntegrationsType, onChangeType } = useEditingIntegrations();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const [queryParams, setQueryParams] = useSearchParams();

  const [fieldMapperOpen, setFieldMapperOpen] = useState(false);

  useEffect(() => {
    if (queryParams.get('callback') === 'true' && !!queryParams.get('callbackType')) {
      enqueueSnackbar(
        `${startCase(queryParams.get('callbackType') || '')} enrollment was successful!`,
        {
          variant: 'success',
          persist: true,
        }
      );
      queryParams.delete('callback');
      queryParams.delete('callbackType');
      setQueryParams(queryParams);
    }
  }, [enqueueSnackbar, queryParams, setQueryParams]);

  const handleOpenFieldMapper = () => {
    setFieldMapperOpen(true);
  };

  const advisorServices = [...services, ...additionalAdvisorServices];

  const firmServices = [...services, ...additionalFirmServices];

  const FIRM_ADMIN_IS_ADVISOR_TAB_LIST = [
    {
      value: roles.ADVISOR,
      icon: <Iconify icon={'ic:round-person'} width={20} height={20} />,
      component: <IntegrationsList list={advisorServices} isAdvisorTab={true} />,
    },
    {
      value: 'firm',
      icon: <Iconify icon={'ic:round-apartment'} width={20} height={20} />,
      component: <IntegrationsList list={firmServices} />,
    },
  ];

  const handleCloseFieldMapper = () => {
    setFieldMapperOpen(false);
    setSelectedIntegrationId('');
    setSelectedTemplateId('');
  };

  return (
    <Page title="Integrations">
      <Container>
        <HeaderBreadcrumbs
          heading="Integrations"
          links={[{ name: 'Dashboard', href: `${PATH_DASHBOARD.root}/` }, { name: 'Integrations' }]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon={'icon-park-solid:connection-point'} />}
              onClick={handleOpenFieldMapper}
            >
              CRM Field Mapper
            </Button>
          }
        />
        {authUser?.role === roles.FIRM_ADMIN && firmAdminUser?.isAdvisor ? (
          <>
            <Tabs
              value={editingIntegrationsType}
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={(e, value) => onChangeType(value)}
            >
              {FIRM_ADMIN_IS_ADVISOR_TAB_LIST.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  label={tab.value === 'firm' ? `Firm's Integrations` : 'My Integrations'}
                  icon={tab.icon}
                  value={tab.value}
                />
              ))}
            </Tabs>

            <Box sx={{ mb: 5 }} />

            {FIRM_ADMIN_IS_ADVISOR_TAB_LIST.map((tab) => {
              const isMatched = tab.value === editingIntegrationsType;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}
          </>
        ) : (
          <IntegrationsList
            list={editingIntegrationsType === 'firm' ? firmServices : advisorServices}
          />
        )}
      </Container>
      {fieldMapperOpen && (
        <Dialog
          fullWidth
          maxWidth={selectedTemplateId ? 'lg' : 'sm'}
          open={true}
          onClose={handleCloseFieldMapper}
        >
          <DialogTitle>
            <Stack spacing={1} alignItems="center" direction="row">
              <span>CRM Field Mapper</span>
              <Tip title="Certain fields may not be mapped to Integrations for security reasons, such as SSN to Wealthbox." />
            </Stack>
          </DialogTitle>
          {/* <DialogContent> */}
          {selectedTemplateId && selectedIntegrationId ? (
            <DialogContent>
              <CRMFieldMapper
                templateId={selectedTemplateId}
                integrationId={selectedIntegrationId}
              />
              <DialogActions>
                <Button variant="contained" onClick={() => setSelectedTemplateId('')}>
                  Go back
                </Button>
              </DialogActions>
            </DialogContent>
          ) : (
            <>
              <DialogContent>
                <Typography>Select template to map</Typography>
              </DialogContent>
              <TemplateAndIntegrationSelect
                onContinue={() => undefined}
                setIntegrationId={setSelectedIntegrationId}
                setSelectedTemplateId={setSelectedTemplateId}
              />
            </>
          )}
          {/* </DialogContent> */}
        </Dialog>
      )}
    </Page>
  );
}
