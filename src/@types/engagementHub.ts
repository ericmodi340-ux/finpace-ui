export interface EmailTemplate {
  emailTemplateId: string;
  emailType: string | null;
  name: string;
  subject?: string;
  lastUpdated: string;
  isActive: boolean;
  advisorId?: string;
  isSystemTemplate?: boolean;
}

export type EmailTemplateWithAllFields = EmailTemplate & {
  json?: any;
};

export type EngagementHubState = {
  isLoading: boolean;
  loaded: boolean;
  error: Error | string | null;
  emailTemplates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
};
