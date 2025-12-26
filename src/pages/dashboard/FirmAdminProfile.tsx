import { capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container, Box, Tabs, Tab, Alert, AlertTitle } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// @types
import { FirmAdminManager } from '../../@types/firmAdmin';
import { UserRole } from '../../@types/user';
// hooks
import useParamTabs from 'hooks/useParamTabs';
import useSettings from 'hooks/useSettings';
import useUserFromStore from 'hooks/useUserFromStore';
// components
import Page from 'components/Page';
import Iconify from 'components/Iconify';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
// sections
import { FirmAdminGeneral } from 'sections/@dashboard/firm-admin/profile';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

export default function FirmAdminProfile() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { firmAdminId = '' } = useParams();
  const isEdit = !pathname.includes('/firm-admins/new');

  const currentFirmAdmin = useUserFromStore(
    firmAdminId,
    roles.FIRM_ADMIN as UserRole.FIRM_ADMIN
  ) as FirmAdminManager;
  const firmAdminName = currentFirmAdmin?.name || '';

  const { currentTab, setCurrentTab } = useParamTabs('general');

  const PROFILE_TABS = [
    {
      value: 'general',
      label: 'General',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: (
        <FirmAdminGeneral
          isEdit={isEdit}
          currentFirmAdmin={currentFirmAdmin}
          firmAdminId={firmAdminId}
        />
      ),
    },
  ];

  return (
    <Page title="Add Firm Admin">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new firm admin' : firmAdminName || 'Edit firm admin'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Firm Admins', href: PATH_DASHBOARD['firm-admins'].root },
            {
              name: !isEdit
                ? 'New firm admin'
                : firmAdminName || currentFirmAdmin?.email || 'Edit firm admin',
            },
          ]}
        />

        {!isEdit || currentFirmAdmin ? (
          <>
            <Tabs
              value={currentTab}
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={(e, value) => setCurrentTab(value)}
            >
              {PROFILE_TABS.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  label={tab.label || capitalCase(tab.value)}
                  icon={tab.icon}
                  value={tab.value}
                />
              ))}
            </Tabs>

            <Box sx={{ mb: 5 }} />

            {PROFILE_TABS.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}
          </>
        ) : (
          <Alert severity="warning">
            <AlertTitle>Firm admin not found</AlertTitle>
            We could not find a firm admin with this ID. Please try again.
          </Alert>
        )}
      </Container>
    </Page>
  );
}
