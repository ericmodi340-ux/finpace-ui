import { EnvelopeFinalizeType, EnvelopeManager } from './envelope';
import { TemplateWithFieldsManager } from './template';
import { UserRole } from './user';

// ----------------------------------------------------------------------

export enum FormFinalizeType {
  COMPLETE_FORM = 'complete-form',
  SEND_FORM = 'send-form',
  SAVE_EXIT = 'save-exit',
}

export enum FormStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FormReviewerStatus {
  PENDING = 'pending',
  SENT = 'sent',
  REVIEWED = 'reviewed',
  DECLINED = 'declined',
}

export type FormSubmission = {
  [templateId: string]: {
    [key: string]: any;
  };
};

export type FormReviewer = {
  id: string;
  type: UserRole.ADVISOR | UserRole.CLIENT;
  name: string;
  email: string;
  dateReviewed?: Date;
  dateSent?: Date | string;
  dateDeclined?: Date | string;
  lastSubmittedAt?: Date | string;
  reviewedPages?: string[];
  // status: FormReviewerStatus;
  // submission?: FormSubmission;
};

export type FormManager = {
  advisorId: string;
  cancelReason?: string;
  clientId: string;
  clientTypeName: string;
  createdAt: Date | string;
  currentReviewerRole: UserRole.ADVISOR | UserRole.CLIENT;
  dateCancelled?: Date | string;
  dateCompleted?: Date | string;
  dateSent?: Date | string;
  envelopeId?: string;
  firmId: string;
  id: string;
  orionAccountNumber?: string;
  reviewers: FormReviewer[];
  advisorReviewedPages?: {
    [templateId: string]: string[];
  };
  clientReviewedPages?: {
    [templateId: string]: string[];
  };
  submission?: FormSubmission;
  status: FormStatus;
  templateId: string;
  compositeTemplates?: CompositeTemplate[];
  formTitle?: string;
  isSigningEvent?: boolean;
  envelope?: EnvelopeManager;
};

export type CompositeTemplate = {
  templateId: string;
  signers: string[];
};

export type FormsState = {
  isLoading: boolean;
  error: Error | string | null;
  byId: { [key: string]: FormManager };
  allIds: string[];
  loaded: boolean;
};

export type CreatePublicFormPayload = {
  firmId: string;
  templateId: string;
  advisorId: string;
  clientName: string;
  clientEmail: string;
};

export interface CreatePublicFormResponse {
  form?: FormManager;
  template?: TemplateWithFieldsManager;
  isDataSecureInPublicForms?: boolean;
  redirectUrl?: string;
}

export interface FinalizeOption {
  id: FormFinalizeType | EnvelopeFinalizeType;
  title: string;
  tooltip: string;
  icon: string;
  handleClick: (id: FormFinalizeType | EnvelopeFinalizeType) => Promise<void>;
  comingSoon?: boolean;
}

export type IFormTableFilters = {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

export type IFormTableFilterValue = string | string[] | Date | null;
