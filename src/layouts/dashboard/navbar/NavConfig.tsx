// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { FirmPlanId } from '../../../@types/firm';
// utils
// constants
import { roles } from 'constants/users';
import { ThemeMode } from 'components/settings/type';
import SvgIconStyle from 'components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name: string) => (
  <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  chat: getIcon('ic_chat'),
  dashboard: getIcon('ic_dashboard'),
  invoice: getIcon('ic_invoice'),
  template: getIcon('ic_template'),
  status: getIcon('signing_status_gray'),
  formsLight: getIcon('forms-light-mode'),
  formsDark: getIcon('forms-dark-mode'),
  docuvaultLight: getIcon('docuVault-light-mode'),
  docuvaultDark: getIcon('docuVault-dark-mode'),
  integrations: getIcon('integrations_gray'),
  activity: getIcon('ic_ledger'),
  operationsDark: getIcon('operations-dark-mode'),
  operationsLight: getIcon('operations-light-mode'),
  signingStatusDark: getIcon('signing-status-dark-mode'),
  signingStatusLight: getIcon('signing-status-light-mode'),
  customersDark: getIcon('customers-dark-mode'),
  customersLight: getIcon('customers-light-mode'),
  calendarDark: getIcon('calendar-alt-dark-mode'),
  calendarLight: getIcon('calendar-alt-light-mode'),
  homeDark: getIcon('home-dark-mode'),
  homeLight: getIcon('home-light-mode'),
  teamDark: getIcon('team-dark-mode'),
  teamLight: getIcon('team-light-mode'),
  integrationsDark: getIcon('integrations-dark-mode'),
  integrationsLight: getIcon('integrations-light-mode'),
  engagementHubDark: getIcon('engagement-hub-dark-mode'),
  engagementHubLight: getIcon('engagement-hub-light-mode'),
};

const getNavConfig = (user: any, planId: FirmPlanId | undefined, themeMode: ThemeMode) => {
  if (!planId) return [];

  const clientNav = [
    // OVERVIEW
    // ----------------------------------------------------------------------
    {
      subheader: 'overview',
      items: [
        {
          title: 'Home',
          path: PATH_DASHBOARD.root,
          icon: themeMode === 'dark' ? ICONS.homeDark : ICONS.homeLight,
        },
        { title: 'Chat', path: PATH_DASHBOARD.clientDashboard.chat, icon: ICONS.chat },
        {
          title: 'Forms',
          path: PATH_DASHBOARD.clientDashboard.forms,
          icon: themeMode !== 'dark' ? ICONS.formsLight : ICONS.formsDark,
        },
        {
          title: 'Docuvault',
          path: PATH_DASHBOARD.clientDashboard.docuvault,
          icon: themeMode !== 'dark' ? ICONS.docuvaultLight : ICONS.docuvaultDark,
        },
      ],
    },
  ];

  const NAV_ITEMS = {
    // Overview
    Analytics: {
      title: 'Home',
      path: PATH_DASHBOARD.root,
      icon: themeMode === 'dark' ? ICONS.homeDark : ICONS.homeLight,
    },
    SigningStatus: {
      title: 'Signing Status',
      path: PATH_DASHBOARD.general.signingStatus,
      icon: themeMode === 'dark' ? ICONS.signingStatusDark : ICONS.signingStatusLight,
    },
    Kanban: {
      title: 'Kanban',
      path: PATH_DASHBOARD.general.kanban,
      icon: themeMode === 'dark' ? ICONS.signingStatusDark : ICONS.signingStatusLight,
    },
    Calendar: {
      title: 'Calendar',
      path: PATH_DASHBOARD.calendar.root,
      icon: themeMode === 'dark' ? ICONS.calendarDark : ICONS.calendarLight,
      inBeta: true,
    },
    // Management
    Team: {
      title: 'team',
      icon: themeMode === 'dark' ? ICONS.teamDark : ICONS.teamLight,
      path: '',
      children: [
        { title: 'firm admins', path: PATH_DASHBOARD['firm-admins'].root },
        { title: 'advisors', path: PATH_DASHBOARD.advisors.root },
      ],
    },
    DataCollection: {
      title: 'Forms',
      icon: themeMode === 'dark' ? ICONS.formsLight : ICONS.formsDark,
      path: PATH_DASHBOARD.dataCollection.forms,
      inBeta: true,
    },
    Operations: {
      title: 'operations',
      icon: themeMode === 'dark' ? ICONS.operationsDark : ICONS.operationsLight,
      path: '',
      children: [
        {
          title: 'web forms',
          path: PATH_DASHBOARD.general.webForms,
        },
        {
          title: 'my templates',
          path: PATH_DASHBOARD.templates.root,
        },

        ...(user?.role === roles.FIRM_ADMIN
          ? [{ title: 'templates library', path: PATH_DASHBOARD.library.root }]
          : []),
        {
          title: 'Automation hub',
          path: PATH_DASHBOARD.automation.root,
        },
        {
          title: 'ledger',
          path: PATH_DASHBOARD.ledger.root,
        },
      ],
    },
    Clients: {
      title: 'customers',
      path: PATH_DASHBOARD.clients.root,
      icon: themeMode === 'dark' ? ICONS.customersDark : ICONS.customersLight,
    },
    EngagementHub: {
      title: 'engagement hub',
      path: PATH_DASHBOARD.engagementHub.emailTemplates,
      icon: themeMode === 'dark' ? ICONS.engagementHubDark : ICONS.engagementHubLight,
      inBeta: true,
      // children: [{ title: 'Email templates', path: PATH_DASHBOARD.engagementHub.emailTemplates }],
    },
    Integrations: {
      title: 'integrations',
      path: PATH_DASHBOARD.general.integrations,
      icon: themeMode === 'dark' ? ICONS.integrationsDark : ICONS.integrationsLight,
    },
  };

  const navConfig =
    user?.role === roles.CLIENT
      ? clientNav
      : [
          // OVERVIEW
          // ----------------------------------------------------------------------
          {
            subheader: 'overview',
            items: [
              NAV_ITEMS.Analytics,
              NAV_ITEMS.SigningStatus,
              // NAV_ITEMS.DataCollection,
              // NAV_ITEMS.Kanban,
              NAV_ITEMS.Operations,
              ...([roles.ADVISOR, roles.FIRM_ADMIN].includes(user?.role)
                ? [NAV_ITEMS.EngagementHub]
                : []),
              // NAV_ITEMS.SigningStatus,
              // NAV_ITEMS.WebForms,
            ],
          },

          // MANAGEMENT
          // ----------------------------------------------------------------------
          {
            subheader: 'management',
            items: [
              NAV_ITEMS.Clients,
              ...(user?.role === roles.FIRM_ADMIN ? [NAV_ITEMS.Team] : []),
              NAV_ITEMS.Calendar,
              NAV_ITEMS.Integrations,
            ],
          },
        ];

  return navConfig;
};

export default getNavConfig;
