import { SendSmsType } from './sms';
import { UserEmailSettings, UserStatus } from './user';

// ----------------------------------------------------------------------

export type FirmAdminManager = {
  id: string;
  firmId: string;
  name: string;
  email: string;
  status: UserStatus;
  isAdvisor: boolean;
  isVerified: boolean;
  stripeBillingManager?: boolean;
  crd?: string;
  masterAccountNumber?: string;
  settings: {
    emailOn?: UserEmailSettings;
    gettingStarted?: GettingStartedSettings;
  };
  createdAt: string;
  phoneNumber: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  managementFees?: {
    details: string;
    timing: string;
    valuation: string;
    frequency: string;
  };
};

export type GettingStartedSettings = {
  tutorialFinished?: boolean;
  supportVideoWatched?: boolean;
  hidden?: boolean;
};

export type FirmAdminsState = {
  isLoading: boolean;
  error: Error | string | null;
  byId: { [key: string]: FirmAdminManager };
  allIds: string[];
  sms: SendSmsType[];
};
