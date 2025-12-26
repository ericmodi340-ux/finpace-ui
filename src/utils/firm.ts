import { FirmManager } from '../@types/firm';
import { firmIds } from 'constants/firms';

// ----------------------------------------------------------------------

export function hasActivePlan(firm: FirmManager) {
  let hasActivePlan = false;

  const currentPeriodEnd = firm?.plan?.currentPeriodEnd
    ? new Date(firm?.plan?.currentPeriodEnd)
    : null;

  if (firm?.stripeCustomerId && currentPeriodEnd && currentPeriodEnd.getTime() > Date.now()) {
    hasActivePlan = true;
  }
  return hasActivePlan;
}

export function isGWN(firmId: string | undefined) {
  return firmId === firmIds.GWN;
}
