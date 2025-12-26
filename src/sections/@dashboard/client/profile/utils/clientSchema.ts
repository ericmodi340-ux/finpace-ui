import { isValid } from 'date-fns';
import * as Yup from 'yup';

const phoneNumberSchema = Yup.string()
  .nullable()
  .notRequired()
  .test('phone-number', 'Invalid phone number! Must be a 10-digit number', function (value) {
    if (!value) {
      // Return true if the value is null or empty
      return true;
    }

    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) return false;
    return true;
  });

const zipCodeSchema = Yup.string()
  .nullable()
  .notRequired()
  .test('zip-code', 'Invalid zip code! Must be a 5-digit number', function (value) {
    if (!value) {
      // Return true if the value is null or empty
      return true;
    }

    // Regular expression to match a 5-digit zip code
    const zipCodePattern = /^\d{5}$/;

    // Check if the value matches the pattern
    if (!zipCodePattern.test(value)) {
      return false;
    }

    return true;
  });

const ssnSchema = Yup.string()
  .nullable()
  .notRequired()
  .test('ssn', 'Invalid SSN format! Must be a 9-digit number', function (value) {
    if (!value) {
      // Return true if the value is null or empty
      return true;
    }

    // Regular expression to match a 9-digit SSN and remove dashes or any other characters
    const cleanedString = value.replace(/\D/g, '');

    // Check if the value matches the pattern
    if (cleanedString.length !== 9) {
      return false;
    }

    return true;
  });

const dateOfBirthSchema = Yup.string()
  .nullable()
  .test('dateOfBirth', 'Date of birth is invalid', function (value) {
    if (!value) {
      return true;
    }

    if (isValid(new Date(value))) {
      return true;
    }

    return false;
  });

const arrayStringSchema = Yup.array()
  .of(Yup.string().nullable())
  .transform((value, originalValue) => {
    if (Array.isArray(originalValue)) {
      return originalValue.filter((item) => typeof item === 'string' || item === null);
    }
    return [];
  });

export const InvestorSchema = Yup.object().shape({
  firstName: Yup.string().nullable().required("First name can't be empty"),
  middleInitial: Yup.string().nullable(),
  lastName: Yup.string().nullable().required("Last name can't be empty"),
  sex: Yup.string().nullable(),
  email: Yup.string().nullable().email('Email is invalid').required("Email can't be empty"),
  phoneNumber: phoneNumberSchema,
  dateOfBirth: dateOfBirthSchema,
  preferredName: Yup.string().nullable(),
  maritalStatus: Yup.string().nullable(),
  ssn: ssnSchema,
  driversLicenseNumber: Yup.string().nullable(),
  type: Yup.string().nullable(),
  tags: arrayStringSchema, // yet to add
  addresses: Yup.array().of(
    Yup.object().shape({
      address1: Yup.string(),
      address2: Yup.string(),
      city: Yup.string(),
      isMailingAddress: Yup.boolean(),
      state: Yup.string(),
      type: Yup.string().nullable(),
      zipCode: Yup.string(),
    })
  ),
  dependents: Yup.array().of(
    Yup.object().shape({
      relationship: Yup.string().nullable(),
      sharePercentage: Yup.string().nullable(),
      type: Yup.string().nullable(),
      name: Yup.string().nullable(),
      firstName: Yup.string().nullable(),
      middleInitial: Yup.string().nullable(),
      lastName: Yup.string().nullable(),
      address: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      zipCode: zipCodeSchema,
      dateOfBirth: Yup.string().nullable(),
      phoneNumber: phoneNumberSchema,
      email: Yup.string().nullable().email(),
      ssn: ssnSchema,
    })
  ),
  beneficiaries: Yup.array().of(
    Yup.object().shape({
      relationship: Yup.string().nullable(),
      sharePercentage: Yup.string().nullable(),
      type: Yup.string().nullable(),
      name: Yup.string().nullable(),
      firstName: Yup.string().nullable(),
      middleInitial: Yup.string().nullable(),
      lastName: Yup.string().nullable(),
      address: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      zipCode: zipCodeSchema,
      dateOfBirth: dateOfBirthSchema,
      phoneNumber: phoneNumberSchema,
      email: Yup.string().nullable().email(),
      ssn: ssnSchema,
    })
  ),
  ids: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().nullable(),
      number: Yup.string().nullable(),
      issuer: Yup.string().nullable(),
      issueDate: dateOfBirthSchema,
      expirationDate: Yup.date()
        .typeError('Expiration Date is invalid')
        .nullable()
        .test(
          'expirationDate',
          'Expiration date should be greater than issue date',
          function (value) {
            const { issueDate } = this.parent;
            if (!value || !issueDate) return true;
            return new Date(value).getTime() > new Date(issueDate).getTime();
          }
        ),
    })
  ),
  socialMedia: Yup.object().shape({
    facebook: Yup.string().nullable(),
    instagram: Yup.string().nullable(),
    linkedin: Yup.string().nullable(),
    twitter: Yup.string().nullable(),
    youtube: Yup.string().nullable(),
    homeWebsite: Yup.string().nullable(),
    otherWebsite: Yup.string().nullable(),
    workWebsite: Yup.string().nullable(),
  }),
  employmentStatus: Yup.string().optional().nullable(),
  employerName: Yup.string().nullable(),
  occupation: Yup.string().nullable(),
  employerPhone: phoneNumberSchema,
  employerAddress: Yup.string().nullable(),
  employerCity: Yup.string().nullable(),
  employerState: Yup.string().nullable(),
  employerZipCode: zipCodeSchema,
  annualIncome: Yup.string().nullable(),

  investorObjective: arrayStringSchema,
  timeHorizon: Yup.string().nullable(),
  riskTolerance: Yup.string().nullable(),
  retirementAge: Yup.string().nullable(),
  riskScore: Yup.string().nullable(),
  needMoneyFromInvestmentsIn: Yup.string().nullable(),
  needMoneyToLastFor: Yup.string().nullable(),
  investingKnowledge: Yup.string().nullable(),
  currentPortfolioValue: Yup.string().nullable(),
  currentUnderstandingOfInvestments: Yup.string().nullable(),
  currentAge: Yup.string().nullable(),
  investorHasExperienceWith: arrayStringSchema,
  answersToRiskToleranceQuestions: arrayStringSchema,

  assets: Yup.string().nullable().optional(),
  federalTaxBracket: Yup.string().nullable(),
  investableAssets: Yup.string().nullable(),
  liabilities: Yup.string().nullable(),
  liquidNetWorth: Yup.string().nullable(),
  netWorth: Yup.string().nullable(),
  residenceValue: Yup.string().nullable(),
  totalInvestments: Yup.string().nullable(),
  aum: Yup.string().nullable(),

  assetsList: Yup.object().shape({
    cash: Yup.string().nullable(),
    brokerageAccountS: Yup.string().nullable(),
    iraS: Yup.string().nullable(),
    '401K': Yup.string().nullable(),
    realEstate: Yup.string().nullable(),
    crypto: Yup.string().nullable(),
    businessEs: Yup.string().nullable(),
    other: Yup.string().nullable(),
    cashValueLifeInsurance: Yup.string().nullable(),
    cashValueLifeInsuranceEquity: Yup.string().nullable(),
  }),

  liabilitiesList: Yup.object().shape({
    realEstate: Yup.string().nullable(),
    heloc: Yup.string().nullable(),
    personalLoanS: Yup.string().nullable(),
    businessLoanS: Yup.string().nullable(),
    autoLoanS: Yup.string().nullable(),
    studentLoanS: Yup.string().nullable(),
    taxDebt: Yup.string().nullable(),
    creditCardS: Yup.string().nullable(),
    medicalDebt: Yup.string().nullable(),
    other: Yup.string().nullable(),
  }),

  attorneyEmail: Yup.string().nullable().email(),
  attorneyName: Yup.string().nullable(),
  attorneyPhone: phoneNumberSchema,
  cpaName: Yup.string().nullable(),
  cpaEmail: Yup.string().nullable().email(),
  cpaPhone: phoneNumberSchema,
  familyOfficerEmail: Yup.string().email(),
  familyOfficerName: Yup.string().nullable(),
  familyOfficerPhone: phoneNumberSchema,
  insuranceBrokerEmail: Yup.string().email(),
  insuranceBrokerName: Yup.string().nullable(),
  insuranceBrokerPhone: phoneNumberSchema,
  trustedContactEmail: Yup.string().email(),
  trustedContactName: Yup.string().nullable(),
  trustedContactPhone: phoneNumberSchema,
  executorName: Yup.string().nullable(),
  executorEmail: Yup.string().email().nullable(),
  executorPhone: phoneNumberSchema,
  isProspect: Yup.boolean(),
  isVerified: Yup.boolean(),
  status: Yup.string().nullable(),
  advisorId: Yup.string().nullable(),
});
