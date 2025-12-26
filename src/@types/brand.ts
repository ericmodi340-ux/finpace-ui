import { UserRole } from './user';

// ----------------------------------------------------------------------

export type BrandContextProps = {
  type: 'firm' | UserRole.ADVISOR | null;
  id: string;
  name: string;
  calendarUrl: string | undefined;
};
