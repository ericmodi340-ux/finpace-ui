// ----------------------------------------------------------------------

type EmailSettings = {
  body: string;
  subject: string;
};

export type EnvelopeDisclosureDoc = {
  name: string;
  link: string;
};

enum EnvelopeSendDisclosuresWhen {
  ON_ADD = 'on-add',
  WITH_CONTRACT = 'with-contract',
  ON_CONTRACT_COMPLETE = 'on-contract-complete',
}

type EnvelopeDisclosureSettings = {
  emailSettings: EmailSettings;
  includeDisclosures: boolean;
  sendDisclosuresWhen: EnvelopeSendDisclosuresWhen;
  disclosureDocs: EnvelopeDisclosureDoc[];
};

export enum EnvelopeFinalizeType {
  PREVIEW = 'preview',
  SEND = 'send',
  SIGN = 'sign',
}

export enum EnvelopeDeliveryMethod {
  EMAIL = 'email',
  EMBEDDED = 'embedded',
}

export enum EnvelopeStatus {
  SENT = 'sent',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EnvelopeSigningStatus {
  SENT = 'sent',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  'Awaiting Client' = 'Awaiting Client',
  'Awaiting Advisor' = 'Awaiting Advisor',
}

export enum EnvelopeSigner {
  FIRST_INVESTOR = 'client_1',
  SECOND_INVESTOR = 'client_2',
  ADVISOR = 'advisor',
  FIRM = 'firm',
}

enum EnvelopeRecipientStatus {
  SENT = 'sent',
  SIGNED = 'completed',
}

export type EnvelopeRecipient = {
  id: string;
  name: string;
  email: string;
  signedAt?: Date | string;
  recipientId: '1' | '2' | '3' | '4';
  routingOrder: string;
  role: 'signer' | 'cc' | string;
  roleName: EnvelopeSigner;
  status: EnvelopeRecipientStatus;
  signatureBase64?: string;
  initialsBase64?: string;
};

export type EnvelopeRecipients = {
  [key: string]: EnvelopeRecipient | undefined;
  client_1: EnvelopeRecipient;
  client_2?: EnvelopeRecipient;
  advisor: EnvelopeRecipient;
  firm?: EnvelopeRecipient;
};

export type EnvelopeManager = {
  id: string;
  firmId: string;
  advisorId: string;
  clientId: string;
  dateCancelled?: Date;
  dateCompleted?: Date;
  sentAt?: Date;
  deliveryMethod: EnvelopeDeliveryMethod;
  preview?: boolean;
  useDocusign?: boolean;
  disclosureSettings: EnvelopeDisclosureSettings;
  formTitle: string;
  pdfUrl: string;
  recipients: EnvelopeRecipients;
  status: EnvelopeStatus;
  type: string;
  voidReason?: string;
  client?: ClientType;
  templateId?: string;
  completedAt?: string;
  advisor?: AdvisorType;
  signingEventType?: 'docusign' | 'finpaceDynamicSign' | 'finpaceSign';
  formId?: string;
};

type ClientType = {
  email: string;
  id: string;
  name: string;
};

type AdvisorType = {
  email: string;
  name: string;
};

export type EnvelopeState = {
  isLoading: boolean;
  error: Error | string | null;
  envelopes: EnvelopeManager[];
  loaded: boolean;
};

export type IEnvelopeTableFilters = {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

export type IEnvelopeTableFilterValue = string | string[] | Date | null;
