import { capitalCase } from 'change-case';
// @mui
import { Container, Tab, Box, Tabs } from '@mui/material';
// @types
import { FirmAdminManager } from '../../@types/firmAdmin';
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
// sections
import {
  FirmGeneral,
  FirmSigningReminders,
  FirmDisclosures,
  FirmTeam,
  FirmBilling,
  FirmCrm,
} from 'sections/@dashboard/settings/firm';
// constants
import { roles } from 'constants/users';
import FirmCalendar from 'sections/@dashboard/settings/firm/FirmCalendar';

// ----------------------------------------------------------------------

export default function FirmSettings() {
  const { themeStretch } = useSettings();
  const { authUser, user } = useUser();

  const adminIsAdvisor =
    authUser?.role === roles.FIRM_ADMIN && (user as FirmAdminManager)?.isAdvisor;

  const { currentTab, setCurrentTab } = useParamTabs('general');

  const FIRM_TABS = [
    {
      value: 'general',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: <FirmGeneral />,
    },
    {
      value: 'emails',
      icon: <Iconify icon={'eva:email-fill'} width={20} height={20} />,
      component: (
        <>
          <FirmSigningReminders />
        </>
      ),
    },
    {
      value: 'disclosures',
      icon: <Iconify icon={'eva:file-text-fill'} width={20} height={20} />,
      component: <FirmDisclosures isAdvisor={adminIsAdvisor} />,
    },
    {
      value: 'team',
      icon: <Iconify icon={'eva:people-fill'} width={20} height={20} />,
      component: <FirmTeam />,
    },
    {
      value: 'billing',
      icon: <Iconify icon={'eva:credit-card-outline'} width={20} height={20} />,
      component: <FirmBilling />,
    },
    {
      value: 'calendar',
      icon: <Iconify icon={'ph:calendar-fill'} width={20} height={20} />,
      component: <FirmCalendar />,
    },
    {
      value: 'CRM Layout',
      icon: <Iconify icon={'icon-park-solid:connection-point'} width={20} height={20} />,
      component: <FirmCrm />,
    },
    // {
    //   value: 'other',
    //   icon: <Iconify icon={'icon-park-solid:connection-point'} width={20} height={20} />,
    //   component: <FirmCrm />,
    // },
  ];

  return (
    <Page title="Firm Settings">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Firm Settings"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Settings', href: PATH_DASHBOARD.settings.root },
            { name: 'Firm' },
          ]}
        />

        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(e, value) => setCurrentTab(value)}
        >
          {FIRM_TABS.map((tab) => (
            <Tab
              disableRipple
              key={tab.value}
              label={tab.value}
              icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Box sx={{ mb: 5 }} />

        {FIRM_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
