import { UserRole } from './user';

// ----------------------------------------------------------------------

export enum NotificationType {
  ENVELOPE_CREATED = 'ENVELOPE_CREATED',
  SIGNER_SIGNED = 'SIGNER_SIGNED',
  ENVELOPE_COMPLETED = 'ENVELOPE_COMPLETED',
  ENVELOPE_DECLINED = 'ENVELOPE_DECLINED',
  ENVELOPE_CANCELLED = 'ENVELOPE_CANCELLED',
  FORM_SENT = 'FORM_SENT',
  REVIEWER_SENT = 'REVIEWER_SENT',
  REVIEWER_REVIEWED = 'REVIEWER_REVIEWED',
  REVIEWER_DECLINED = 'REVIEWER_DECLINED',
  FORM_COMPLETED = 'FORM_COMPLETED',
  FORM_DECLINED = 'FORM_DECLINED',
  FORM_CANCELLED = 'FORM_CANCELLED',
  TEMPLATE_CREATED = 'TEMPLATE_CREATED',
  TEMPLATE_UPDATED = 'TEMPLATE_UPDATED',
  TEMPLATE_DELETED = 'TEMPLATE_DELETED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
}

export type NotificationManager = {
  id: string;
  sub: string;
  notificationType: NotificationType;
  read: boolean;
  userType: UserRole;
  createdAt: Date | string;
  firmId: string;
  advisorId?: string;
  clientId?: string;
  notificationText?: string;
  payload?: {
    [key: string]: any;
  };
};

export type NotificationsState = {
  isLoading: boolean;
  error: Error | string | null;
  byId: { [key: string]: NotificationManager };
  allIds: string[];
};
