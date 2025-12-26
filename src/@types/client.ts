import { IntegrationServiceId, IntegrationOwner } from './integration';
import { UserEmailSettings, UserStatus } from './user';

// ----------------------------------------------------------------------

export const FINPACE_CLIENT_DEFAULT_FIELDS: Array<keyof ClientManager | string> = [
  'name',
  'firstName',
  'lastName',
  'middleInitial',
  'sex',
  'email',
  'phoneNumber',
  'dateOfBirth',
  'preferredName',
  'maritalStatus',
  'ssn',
  'driversLicenseNumber',
  'type',
  'spouseName',
  'spouseEmail',
  'spousePhone',

  // ClientAddresssFields
  'homePhoneNumber',
  'homeEmail',
  'address',
  'city',
  'state',
  'zipCode',
  'workPhoneNumber',
  'workEmail',
  'isMailingAddressSameAsHomeAddress',
  'mailingAddress',
  'mailingCity',
  'mailingState',
  'mailingZipCode',
  'addresses',

  // second investor
  'includeSecondInvestor',
  'secondInvestor',

  // Dependents
  'dependents',

  // Beneficiaries
  'beneficiaries',

  // Employment
  'employmentStatus',
  'employerName',
  'occupation',
  'employerPhone',
  'employerAddress',
  'employerCity',
  'employerState',
  'employerZipCode',
  'annualIncome',
  // IDs
  'ids',
  // Team
  'attorneyName',
  'attorneyEmail',
  'attorneyPhone',
  'cpaName',
  'cpaEmail',
  'cpaPhone',
  'insuranceBrokerName',
  'insuranceBrokerEmail',
  'insuranceBrokerPhone',
  'familyOfficerName',
  'familyOfficerEmail',
  'familyOfficerPhone',
  'trustedContactName',
  'trustedContactEmail',
  'trustedContactPhone',
  'executorName',
  'executorEmail',
  'executorPhone',
  // socialMedia
  'socialMedia',

  // Financial
  'assets',
  'federalTaxBracket',
  'investableAssets',
  'liabilities',
  'liquidNetWorth',
  'netWorth',
  'residenceValue',
  'totalInvestments',
  'aum',

  // Suitability
  'investorObjective',
  'answersToRiskToleranceQuestions',
  'currentAge',
  'currentPortfolioValue',
  'currentUnderstandingOfInvestments',
  'investingKnowledge',
  'investorHasExperienceWith',
  'needMoneyFromInvestmentsIn',
  'needMoneyToLastFor',
  'timeHorizon',
  'retirementAge',
  'riskScore',
  'riskTolerance',

  // Other
  'tags',
];

export type ClientManager = ClientInvestorFields & {
  id: string;
  firmId: string;
  advisorId: string;
  status: UserStatus;
  dateOutreached?: Date | string;
  dateOnboarded: Date | string;
  tags: string[];
  isProspect?: boolean;
  isVerified: boolean;
  includeSecondInvestor: boolean;
  secondInvestor: ClientInvestorFields;
  integrationPushedAt?: {
    [key in IntegrationServiceId]: {
      [key in IntegrationOwner]?: Date | string;
    };
  };
  updatedAt?: Date | string;
  custom?: {
    [key: string]: any;
  };
  settings: {
    emailOn: UserEmailSettings;
  };
  createdAt: string;
  laserAppForms?: {
    [key: string]: string;
  }[];
};

export type ClientState = {
  isLoading: boolean;
  error: Error | string | null;
  client: ClientManager | null;
  notes: ClientNote[];
  meetingNotes: ClientNote[];
};

export type ClientsState = {
  isLoading: boolean;
  error: Error | string | null;
  byId: { [key: string]: ClientManager };
  allIds: string[];
};

export enum NoteType {
  TEXT = 'text',
  ATTACHMENT = 'attachment',
}

export type ClientNote = {
  clientId: string;
  noteId: string;
  text: string;
  url: string;
  attachmentLabel: string;
  createdAt: string;
  creator: string;
  firmId: string;
  tags: string[];
  attachmentUrl: string;
  clientText?: string;
};

// ----------------------------------------------------------------------

export type ClientPersonalFields = {
  name?: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  sex: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  preferredName: string;
  maritalStatus: string;
  ssn: string;
  driversLicenseNumber: string;
  type: string;
  spouseName: string;
  spouseEmail: string;
  spousePhone: string;
};

export type ClientAddresssFields = {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  isMailingAddress: boolean;
};

export type ClientDependentsFields = {
  relationship: string;
  sharePercentage: string;
  type: string;
  name: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string | null;
  phoneNumber: string;
  email: string;
  ssn: string;
};

export type ClientEmploymentFields = {
  employmentStatus: string;
  employerName: string;
  occupation: string;
  employerPhone: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZipCode: string;
  annualIncome: string;
};

export type ClientIDsFields = {
  type: string;
  number: string;
  issuer: string;
  issueDate: string | null;
  expirationDate: string | null;
};

export type ClientTeamFields = {
  attorneyName: string;
  attorneyEmail: string;
  attorneyPhone: string;
  cpaName: string;
  cpaEmail: string;
  cpaPhone: string;
  insuranceBrokerName: string;
  insuranceBrokerEmail: string;
  insuranceBrokerPhone: string;
  familyOfficerName: string;
  familyOfficerEmail: string;
  familyOfficerPhone: string;
  trustedContactName: string;
  trustedContactEmail: string;
  trustedContactPhone: string;
  executorName: string;
  executorEmail: string;
  executorPhone: string;
};

export type ClientFinancialFields = {
  netWorth: string | null;
  liquidNetWorth: string | null;
  federalTaxBracket: string | null;
  investableAssets: string | null;
  totalInvestments: string | null;
  assets: string | null;
  liabilities: string | null;
  residenceValue: string | null;
  aum: string | null;

  assetsList: {
    cash: string | null;
    brokerageAccountS: string | null;
    iraS: string | null;
    '401K': string | null;
    realEstate: string | null;
    crypto: string | null;
    businessEs: string | null;
    other: string | null;
    cashValueLifeInsurance: string | null;
    cashValueLifeInsuranceEquity: string | null;
  };

  liabilitiesList: {
    realEstate: string | null;
    heloc: string | null;
    personalLoanS: string | null;
    businessLoanS: string | null;
    autoLoanS: string | null;
    studentLoanS: string | null;
    taxDebt: string | null;
    creditCardS: string | null;
    medicalDebt: string | null;
    other: string | null;
  };
};

export type ClientOtherFields = {
  isProspect: boolean;
  isVerified: boolean;
  status: UserStatus;
  tags: string[];
  advisorId: string;
};

export type ClientSuitabilityFields = {
  investorObjective: string[];
  needMoneyFromInvestmentsIn: string;
  needMoneyToLastFor: string;
  investingKnowledge: string;
  currentPortfolioValue: string;
  currentUnderstandingOfInvestments: string;
  currentAge: string;
  investorHasExperienceWith: string[];
  answersToRiskToleranceQuestions: string[];
  timeHorizon: string;
  riskTolerance: string;
  retirementAge: string;
  riskScore: string;
};

export type ClientInvestorFields = ClientPersonalFields &
  ClientEmploymentFields &
  ClientSuitabilityFields &
  ClientFinancialFields &
  ClientTeamFields &
  ClientOtherFields & {
    addresses: ClientAddresssFields[];
    dependents?: ClientDependentsFields[];
    beneficiaries?: ClientDependentsFields[];
    ids?: ClientIDsFields[];
    socialMedia?: {
      facebook: any;
      twitter: any;
      linkedin: any;
      instagram: any;
      youtube: any;
      otherWebsite: any;
      workWebsite: any;
      homeWebsite: any;
    };
  };

export interface IClientsTableFilters {
  name: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  tag: string[]; // Changed from string to string[]
}

export type IClientsTableFilterValue = string | string[] | Date | null;
