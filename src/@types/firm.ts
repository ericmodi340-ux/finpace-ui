// ----------------------------------------------------------------------

import { CustomField, Group } from './custom-fields';

type EmailSettings = {
  subject: string;
  body: string;
};

export enum FirmEmailType {
  DISCLOSURES = 'disclosures',
  PROSPECTS = 'prospects',
  CLIENTS = 'clients',
}

export type FirmEmailSettings = {
  [FirmEmailType.DISCLOSURES]: EmailSettings;
  [FirmEmailType.PROSPECTS]: boolean;
  [FirmEmailType.CLIENTS]: boolean;
};

export enum FirmServiceId {
  PROSPECTS = 'prospects',
  CLIENTS = 'clients',
  EXPORT = 'export',
}

export enum FirmPlanId {
  PROSPECT = 'prospect',
  SELL = 'sell',
  PROTECT = 'protect',
  ENTERPRISE = 'enterprise',
}

export type FirmPlan = {
  priceId: string;
  advisorLimit: number;
  currentPeriodEnd: Date | string;
  planId?: FirmPlanId;
  freeTrial: boolean;
};

export type FirmCalendarSettings = {
  url: string;
  customCategories: string[];
  customTypes: string[];
};

export enum FirmSigningReminderSetting {
  ENABLED = 'enabled',
  DELAY = 'delay',
  FREQUENCY = 'frequency',
}

export enum FirmProspectSetting {
  CLIENTS = 'clients',
  PROSPECTS = 'prospects',
  SEND_DISCLOSURE_DOCS_ON_CLIENT_ADD = 'sendDisclosureDocsOnClientAdd',
}

export type FirmSigningReminderSettings = {
  enabled: boolean;
  delay: number;
  frequency: number;
};

export type FirmManager = {
  id: string;
  name: string;
  email: string;
  hideDisclosuresOnClientProfile: boolean;
  isInactive: boolean;
  isVerified: boolean;
  custodian?: string;
  settings?: {
    emails?: FirmEmailSettings;
    calendar?: FirmCalendarSettings;
    signingReminders?: FirmSigningReminderSettings;
    sendDisclosureDocsOnClientAdd?: boolean;
  };
  stripeCustomerId?: string;
  plan?: FirmPlan;
  whiteLabel?: boolean;
  schwabServiceTeam?: string;
  customDomainUrl?: string;
  customDomainTitle?: string;
  ssoClientsOnly?: boolean;
  onHold: boolean;
  clientFields: {
    groups: Group[];
    fields: Record<string, CustomField>;
  };
  tamp: {
    firmName: string;
    masterAccountNumber: string;
  };
};

export type FirmState = {
  isLoading: boolean;
  error: Error | string | null;
  showBillingModal: boolean;
  firm: FirmManager;
  stripeCheckoutSuccess: boolean;
};
