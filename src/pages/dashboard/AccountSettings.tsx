import { capitalCase } from 'change-case';
// @mui
import { Container, Tab, Box, Tabs, Card } from '@mui/material';
// @types
import { FirmAdminManager } from '../../@types/firmAdmin';
import { UserRole } from '../../@types/user';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// hooks
import useParamTabs from 'hooks/useParamTabs';
import useSettings from 'hooks/useSettings';
import useUser from 'hooks/useUser';
// components
import Page from 'components/Page';
import Iconify from 'components/Iconify';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import ProfileCover, { TabsWrapperStyle } from 'components/ProfileCover';
// sections
import {
  AccountGeneral,
  AccountNotifications,
  AccountChangeEmail,
  AdvisorDisclosures,
} from 'sections/@dashboard/settings/account';
// constants
import { roles } from 'constants/users';
import useResponsive from 'hooks/useResponsive';
import AdvisorBranding from 'sections/@dashboard/advisor/profile/AdvisorBranding';
import { AdvisorManager } from '../../@types/advisor';
// ----------------------------------------------------------------------

export default function AccountSettings() {
  const { themeStretch } = useSettings();
  const { authUser, user } = useUser();
  const { currentTab, setCurrentTab } = useParamTabs('general');
  const userRole = authUser?.role as UserRole;
  const isDesktop = useResponsive('up', 'md');

  const adminIsAdvisor =
    authUser?.role === roles.FIRM_ADMIN && (user as FirmAdminManager)?.isAdvisor;

  const ACCOUNT_TABS = [
    {
      value: 'general',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: <AccountGeneral />,
    },
    ...(user?.id && (authUser?.role === roles.ADVISOR || adminIsAdvisor)
      ? [
          {
            value: 'branding',
            label: 'Branding',
            icon: <Iconify icon={'mdi:design'} width={20} height={20} />,
            component: (
              <AdvisorBranding
                isEdit={true}
                currentAdvisor={user as AdvisorManager}
                advisorId={user?.id}
              />
            ),
          },
          {
            value: 'disclosures',
            icon: <Iconify icon={'eva:file-text-fill'} width={20} height={20} />,
            component: <AdvisorDisclosures isAdmin={adminIsAdvisor} userId={user.id} />,
          },
        ]
      : []),
    {
      value: 'notifications',
      icon: <Iconify icon={'eva:bell-fill'} width={20} height={20} />,
      component: <AccountNotifications />,
    },
    {
      value: 'change_email',
      icon: <Iconify icon={'ic:round-email'} width={20} height={20} />,
      component: <AccountChangeEmail />,
    },
  ];

  return (
    <Page title="Account Settings">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Account Settings"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Settings', href: PATH_DASHBOARD.settings.root },
            { name: 'Account' },
          ]}
        />

        <Card
          sx={{
            mb: 3,
            height: isDesktop ? 150 : 280,
            position: 'relative',
          }}
        >
          <ProfileCover id={user?.id || ''} name={user?.name || ''} type={userRole} />

          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={(e, value) => setCurrentTab(value)}
            >
              {ACCOUNT_TABS.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  label={capitalCase(tab.value)}
                  icon={tab.icon}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        <Box sx={{ mb: 5 }} />

        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
