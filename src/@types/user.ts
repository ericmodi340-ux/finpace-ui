import { AdvisorManager } from './advisor';
import { ClientManager } from './client';
import { FirmAdminManager } from './firmAdmin';
import { NotificationType } from './notification';

// ----------------------------------------------------------------------

export enum UserRole {
  FIRM_ADMIN = 'firm-admin',
  ADVISOR = 'advisor',
  CLIENT = 'client',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type UserEmailSettings = { [key in NotificationType]?: boolean | undefined };

type UserManager = AdvisorManager | ClientManager | FirmAdminManager;

export type UserState = {
  isLoading: boolean;
  error: Error | string | null;
  role: UserRole | null;
  user: UserManager | null;
};
