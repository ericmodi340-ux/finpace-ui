import { useSelector } from 'redux/store';

export default function shouldShowBanner() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { firm } = useSelector((state) => state.firm);
  const isFreeTrial = firm?.plan?.freeTrial;
  const endTrialDate = Date.parse(firm?.plan?.currentPeriodEnd as string);
  const today = new Date() as Date;
  const sevenDaysFromToday = today.setDate(today.getDate() + 7);
  const shouldShowBanner = isFreeTrial && sevenDaysFromToday > endTrialDate;

  return shouldShowBanner;
}
