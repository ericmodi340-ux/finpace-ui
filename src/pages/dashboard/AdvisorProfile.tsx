import { capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container, Box, Tabs, Tab, Alert, AlertTitle, Card } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// @types
import { AdvisorManager } from '../../@types/advisor';
import { UserRole } from '../../@types/user';
// hooks
import useParamTabs from 'hooks/useParamTabs';
import useSettings from 'hooks/useSettings';
import useUserFromStore from 'hooks/useUserFromStore';
// components
import Page from 'components/Page';
import Iconify from 'components/Iconify';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import ProfileCover, { TabsWrapperStyle } from 'components/ProfileCover';
// sections
import { AdvisorGeneral } from 'sections/@dashboard/advisor/profile';
// constants
import { roles } from 'constants/users';
import useResponsive from 'hooks/useResponsive';
import ClientListView from 'sections/@dashboard/client/view/client-list-view';
import Disclosures from 'sections/@dashboard/settings/disclosures/Disclosures';
import { types } from 'constants/disclosures';
import { DisclosureType } from '../../@types/disclosure';
import AdvisorBranding from 'sections/@dashboard/advisor/profile/AdvisorBranding';
// ----------------------------------------------------------------------

export default function AdvisorProfile() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { advisorId = '' } = useParams();
  const isEdit = !pathname.includes('/advisors/new');
  const isDesktop = useResponsive('up', 'md');

  const currentAdvisor = useUserFromStore(
    advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;

  const advisorName = currentAdvisor?.name || '';
  const isFirmAdmin = currentAdvisor?.isFirmAdmin;

  const { currentTab, setCurrentTab } = useParamTabs('general');

  const PROFILE_TABS = [
    {
      value: 'general',
      label: 'General',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: (
        <AdvisorGeneral isEdit={isEdit} currentAdvisor={currentAdvisor} advisorId={advisorId} />
      ),
    },
    {
      value: 'branding',
      label: 'Branding',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: (
        <AdvisorBranding isEdit={isEdit} currentAdvisor={currentAdvisor} advisorId={advisorId} />
      ),
    },
    {
      value: 'clients',
      label: 'Clients',
      icon: <Iconify icon={'ic:round-switch-account'} width={20} height={20} />,
      component: <ClientListView filter={(item) => item.advisorId === advisorId} />,
    },
    {
      value: 'disclosures',
      label: 'Disclosures',
      icon: <Iconify icon={'eva:file-text-fill'} width={20} height={20} />,
      component: <Disclosures type={types.ADVISOR as DisclosureType.ADVISOR} userId={advisorId} />,
    },
  ];

  return (
    <Page title="Add Advisor">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new advisor' : advisorName || 'Edit advisor'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Advisors', href: PATH_DASHBOARD.advisors.root },
            {
              name: !isEdit
                ? 'New advisor'
                : advisorName || currentAdvisor?.email || 'Edit advisor',
            },
          ]}
        />

        {!isEdit || currentAdvisor ? (
          <>
            <Card
              sx={{
                mb: 3,
                height: isDesktop ? 150 : 280,
                position: 'relative',
              }}
            >
              <ProfileCover
                id={currentAdvisor?.id}
                name={currentAdvisor?.name}
                type={UserRole.ADVISOR}
                isFirmAdmin={isFirmAdmin}
              />

              <TabsWrapperStyle>
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
              </TabsWrapperStyle>
            </Card>

            <Box sx={{ mb: 5 }} />

            {PROFILE_TABS.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}
          </>
        ) : (
          <Alert severity="warning">
            <AlertTitle>Advisor not found</AlertTitle>
            We could not find an advisor with this ID. Please try again.
          </Alert>
        )}
      </Container>
    </Page>
  );
}
