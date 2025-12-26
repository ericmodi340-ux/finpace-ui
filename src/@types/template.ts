// ----------------------------------------------------------------------

import { EnvelopeSigner } from './envelope';

export enum DsTemplateType {
  BITSY = 'bitsy',
  FIRM = 'firm',
}

export type DsTemplates = {
  [key in DsTemplateType]: { [key: string]: any }[];
};

export type TemplateField = {
  [key: string]: any;
  components?: TemplateField[];
  fields?: any;
};

type TemplateFieldMapping = {
  [key: string]: string;
};

export type FormBuilderFieldsMapping = TemplateField & {
  components: TemplateField[];
};

type TemplateEnvSettings = {
  dsTemplateId: string;
};

type TemplateConfig = {
  prod: TemplateEnvSettings;
  sandbox: TemplateEnvSettings;
};

export type TemplateManager = {
  id: string;
  config: TemplateConfig;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  includeDisclosures: boolean;
  emailToClientOnFormCompletion?: string;
  includedFirmDisclosures: string[];
  inactive: boolean;
  authenticationMode?: string;
  sendDisclosuresWhen: 'on-add' | 'with-contract' | 'on-contract-complete';
  showDisclosuresPage: boolean;
  signingEvent: boolean;
  title: string;
  useForOutreachDate: boolean;
  useForOnboardingDate: boolean;
  dsTemplateId: string;
  dsTemplateType: DsTemplateType;
  description?: string;
  orion?: boolean;
  clientCanCompleteForm?: boolean;
  compositeTemplates?: { signers: string[]; templateId: string }[];
  signingEventType?: 'docusign' | 'finpaceDynamicSign' | 'finpaceSign';
  useDocusign?: boolean;
  isDataSecureInPublicForms?: boolean;
  addFirmLogoOnForm?: boolean;
  showFundAllocator?: boolean;
  disclosures?: {
    firm: boolean;
    advisor: boolean;
  };
  redirectOnComplete?: boolean;
  redirectUrl?: string;
  completeButtonText?: string;
  onCompleteHeading?: string;
  onCompleteSubHeading?: string;
  publicFormFirstHeading?: string;
  publicFormFirstSubHeading?: string;
  surveyJsEnabled?: boolean;
};

interface rolesDocusign {
  type: EnvelopeSigner;
  role: 'signer' | 'cc';
}

export type TemplateWithFieldsManager = TemplateManager & {
  dsFieldMapping: TemplateFieldMapping;
  fields: FormBuilderFieldsMapping[];
  pdfFormSchema?: any;
  jsonEditorOutput?: string;
  projectJson?: any;
  richTextHtml?: string;
  signers?: rolesDocusign[];
  showRTE?: boolean;
  surveryJsTemplateSchema?: any;
};

export type TemplatesState = {
  isLoading: boolean;
  loaded: boolean;
  error: Error | string | null;
  byId: { [key: string]: TemplateManager };
  allIds: string[];
  fullTemplate: TemplateWithFieldsManager | null;
};
