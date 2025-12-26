import { UserStatus } from '../../../../../@types/user';
import {
  ClientAddresssFields,
  ClientDependentsFields,
  ClientEmploymentFields,
  ClientFinancialFields,
  ClientIDsFields,
  ClientInvestorFields,
  ClientOtherFields,
  ClientPersonalFields,
  ClientSuitabilityFields,
  ClientTeamFields,
} from '../../../../../@types/client';

export const clientPersonalFieldsInitialValues: ClientPersonalFields = {
  firstName: '',
  lastName: '',
  middleInitial: '',
  sex: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: null,
  preferredName: '',
  maritalStatus: '',
  ssn: '',
  driversLicenseNumber: '',
  type: 'individual',
  spouseName: '',
  spouseEmail: '',
  spousePhone: '',
};

export const clientAddressFieldInitialValues: ClientAddresssFields = {
  address1: '',
  address2: '',
  city: '',
  isMailingAddress: false,
  state: '',
  type: '',
  zipCode: '',
};

const clientDependentsFieldsInitialValues: ClientDependentsFields = {
  relationship: '',
  sharePercentage: '',
  type: '',
  name: '',
  firstName: '',
  middleInitial: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  dateOfBirth: null,
  phoneNumber: '',
  email: '',
  ssn: '',
};

export const clientEmploymentFieldsInitialValues: ClientEmploymentFields = {
  employmentStatus: '',
  employerName: '',
  occupation: '',
  employerPhone: '',
  employerAddress: '',
  employerCity: '',
  employerState: '',
  employerZipCode: '',
  annualIncome: '',
};

const clientIDsFieldsInitialValues: ClientIDsFields = {
  type: '',
  number: '',
  issuer: '',
  issueDate: null,
  expirationDate: null,
};

const clientOtherFieldsInitialValues: ClientOtherFields = {
  advisorId: '',
  isProspect: false,
  isVerified: false,
  status: UserStatus.ACTIVE,
  tags: [],
};

export const clientSuitabilityFieldsInitialValues: ClientSuitabilityFields = {
  investorObjective: [],
  answersToRiskToleranceQuestions: [],
  currentAge: '',
  currentPortfolioValue: '',
  currentUnderstandingOfInvestments: '',
  investingKnowledge: '',
  investorHasExperienceWith: [],
  needMoneyFromInvestmentsIn: '',
  needMoneyToLastFor: '',
  timeHorizon: '',
  retirementAge: '',
  riskScore: '',
  riskTolerance: '',
};

export const clientTeamFieldsInitialValues: ClientTeamFields = {
  attorneyEmail: '',
  attorneyName: '',
  attorneyPhone: '',
  cpaName: '',
  cpaEmail: '',
  cpaPhone: '',
  familyOfficerEmail: '',
  familyOfficerName: '',
  familyOfficerPhone: '',
  insuranceBrokerEmail: '',
  insuranceBrokerName: '',
  insuranceBrokerPhone: '',
  trustedContactEmail: '',
  trustedContactName: '',
  trustedContactPhone: '',
  executorName: '',
  executorEmail: '',
  executorPhone: '',
};

export const clientFinancialFieldsInitialValues: ClientFinancialFields = {
  assets: '',
  federalTaxBracket: '',
  investableAssets: '',
  liabilities: '',
  liquidNetWorth: '',
  netWorth: '',
  residenceValue: '',
  totalInvestments: '',
  aum: '',

  assetsList: {
    cash: '',
    brokerageAccountS: '',
    iraS: '',
    '401K': '',
    realEstate: '',
    crypto: '',
    businessEs: '',
    other: '',
    cashValueLifeInsurance: '',
    cashValueLifeInsuranceEquity: '',
  },

  liabilitiesList: {
    realEstate: '',
    heloc: '',
    personalLoanS: '',
    businessLoanS: '',
    autoLoanS: '',
    studentLoanS: '',
    taxDebt: '',
    creditCardS: '',
    medicalDebt: '',
    other: '',
  },
};

const clientInitialFormValues: ClientInvestorFields = {
  ...clientPersonalFieldsInitialValues,
  dependents: [clientDependentsFieldsInitialValues],
  beneficiaries: [clientDependentsFieldsInitialValues],
  ...clientEmploymentFieldsInitialValues,
  addresses: [clientAddressFieldInitialValues],
  ids: [clientIDsFieldsInitialValues],
  ...clientTeamFieldsInitialValues,
  ...clientFinancialFieldsInitialValues,
  ...clientSuitabilityFieldsInitialValues,
  ...clientOtherFieldsInitialValues,
  socialMedia: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    homeWebsite: '',
    otherWebsite: '',
    workWebsite: '',
  },
};

export default clientInitialFormValues;
