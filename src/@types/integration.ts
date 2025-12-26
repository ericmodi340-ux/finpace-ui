import { IntegrationFields } from './integrationField';
import { UserRole } from './user';

// ----------------------------------------------------------------------

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum IntegrationServiceId {
  CALENDAR = 'calendar',
  DOCUSIGN = 'docusign',
  REDTAIL = 'redtail',
  SALESFORCE = 'salesforce',
  SCHWAB = 'schwab',
  WEALTHBOX = 'wealthbox',
  FIDELITY = 'fidelity',
  LASERAPP = 'laserapp',
  outlook = 'outlook',
  google = 'google',
  zapier = 'zapier',
}

export type IntegrationOwner = 'firm' | UserRole.ADVISOR;

export type IntegrationService = {
  id: IntegrationServiceId;
  image: string;
  imageWhite: string;
  name: string;
  isAvailable: boolean;
};

export type IntegrationTermsAccepted = {
  userId: string;
  acceptedAt: Date | string;
};

export type NewIntegrationsFieldMappingConfig = {
  [key: string]: string;
};

export type NewIntegrationConfig = {
  [key: string]: any;
  integrationType: IntegrationServiceId;
};

export type IntegrationConfig = {
  [key: string]: any;
  id: IntegrationServiceId;
  firmId: string;
  advisorId?: string;
  status?: IntegrationStatus;
  fields?: {
    [key: string]: string;
  };
  termsAccepted?: IntegrationTermsAccepted;
};

export type IntegrationsState = {
  isLoading: boolean;
  error: Error | string | null;
  integrations: IntegrationConfig[];
  integrationsFields: IntegrationFields;
  orionAccounts?: {
    accountType: string;
    currentValue: string;
    name: string;
    number: string;
  }[];
};
