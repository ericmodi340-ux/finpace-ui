import { FirmPlanId, FirmServiceId } from '../@types/firm';
import { planServices } from 'constants/plans';

// ----------------------------------------------------------------------

export function firmHasService(serviceId: FirmServiceId, planId: FirmPlanId | undefined) {
  if (!planId || !serviceId) return false;
  return planServices[planId]?.[serviceId] || false;
}
