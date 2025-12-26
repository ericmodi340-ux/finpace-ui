import { UserEmailSettings, UserStatus } from './user';

// ----------------------------------------------------------------------

export type AdvisorManager = {
  id: string;
  firmId: string;
  name: string;
  email: string;
  status: UserStatus;
  crd: string;
  masterAccountNumber?: string;
  isFirmAdmin: boolean;
  isVerified: boolean;
  settings: {
    emailOn?: UserEmailSettings;
    calendar?: AdvisorCalendarSettings;
    gettingStarted?: GettingStartedSettings;
  };
  createdAt: string;
  managementFees?: {
    details: string;
    timing: string;
    valuation: string;
    frequency: string;
  };
  phoneNumber: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
};
export type GettingStartedSettings = {
  tutorialFinished?: boolean;
  supportVideoWatched?: boolean;
  hidden?: boolean;
};

export type AdvisorState = {
  isLoading: boolean;
  error: Error | string | null;
  advisor: AdvisorManager | null;
};

export type AdvisorsState = {
  isLoading: boolean;
  error: Error | string | null;
  byId: { [key: string]: AdvisorManager };
  allIds: string[];
};

export type AdvisorCalendarSettings = {
  url: string;
};

export type IAdvisorsTableFilters = {
  name: string;
  status: string;
};

export type IAdvisorsTableFilterValue = string | string[] | Date | null;
