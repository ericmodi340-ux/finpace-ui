import { IntegrationServiceId } from '../@types/integration';

export const serviceIds = {
  CALENDAR: 'calendar',
  DOCUSIGN: 'docusign',
  REDTAIL: 'redtail',
  SALESFORCE: 'salesforce',
  SCHWAB: 'schwab',
  WEALTHBOX: 'wealthbox',
  FIDELITY: 'fidelity',
  LASERAPP: 'laserapp',
  GOOGLE: 'google',
  OUTLOOK: 'outlook',
  ZAPIER: 'zapier',
};

export const services = [
  {
    id: serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
    image: '/logo/integrations/redtail.svg',
    imageWhite: '/logo/integrations/redtail-white.png',
    name: 'Redtail',
    isAvailable: true,
  },
  {
    id: serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE,
    image: '/logo/integrations/salesforce.svg',
    imageWhite: '/logo/integrations/salesforce-white.png',
    name: 'Salesforce',
    isAvailable: true,
  },
  {
    id: serviceIds.WEALTHBOX as IntegrationServiceId.WEALTHBOX,
    image: '/logo/integrations/wealthbox.svg',
    imageWhite: '/logo/integrations/wealthbox-white.png',
    name: 'Wealthbox',
    isAvailable: true,
  },
  {
    id: serviceIds.CALENDAR as IntegrationServiceId.CALENDAR,
    image: '/logo/integrations/calendar.png',
    imageWhite: '/logo/integrations/calendar-white.png',
    name: 'Your Calendar',
    isAvailable: true,
  },
  {
    id: serviceIds.SCHWAB as IntegrationServiceId.SCHWAB,
    image: '/logo/integrations/schwab.png',
    imageWhite: '/logo/integrations/schwab-white.png',
    name: 'Schwab',
    isAvailable: true,
  },
  {
    id: serviceIds.LASERAPP as IntegrationServiceId.LASERAPP,
    image: '/logo/integrations/laserapp.png',
    imageWhite: '/logo/integrations/laserapp-white.png',
    name: 'LaserApp',
    isAvailable: true,
  },
];

export const additionalAdvisorServices = [
  {
    id: serviceIds.GOOGLE as IntegrationServiceId.google,
    image: '/logo/integrations/google.png',
    imageWhite: '/logo/integrations/google-white.png',
    name: 'google',
    isAvailable: true,
  },
  {
    id: serviceIds.OUTLOOK as IntegrationServiceId.outlook,
    image: '/logo/integrations/outlook.png',
    imageWhite: '/logo/integrations/outlook-white.png',
    name: 'outlook',
    isAvailable: true,
  },
  {
    id: serviceIds.FIDELITY as IntegrationServiceId.FIDELITY,
    image: '/logo/integrations/wealthscape.png',
    imageWhite: '/logo/integrations/wealthscape.png',
    name: 'Wealthscape',
    isAvailable: true,
  },
  {
    id: serviceIds.ZAPIER as IntegrationServiceId.zapier,
    image: '/logo/integrations/zapier.png',
    imageWhite: '/logo/integrations/zapier.png',
    name: 'Zapier',
    isAvailable: true,
  },
];

export const additionalFirmServices = [
  {
    id: serviceIds.DOCUSIGN as IntegrationServiceId.DOCUSIGN,
    image: '/logo/integrations/docusign.svg',
    imageWhite: '/logo/integrations/docusign-white.png',
    name: 'DocuSign',
    isAvailable: true,
  },
];

export const statuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
