import { FirmAdminManager } from '../@types/firmAdmin';

// ----------------------------------------------------------------------

export function getFirmAdminName(firmAdmin?: FirmAdminManager) {
  if (!firmAdmin) return '';
  return firmAdmin.name || '';
}
