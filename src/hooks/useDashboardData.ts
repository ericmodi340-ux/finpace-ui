import { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'redux/store';
import { getTemplates } from '../redux/slices/templates';
import { getAutomations } from '../redux/slices/automations';
import { getEnvelopes } from '../redux/slices/envelopes';
import { getForms } from '../redux/slices/forms';
import { automationStatus } from '../constants/automation';
import { formStatuses } from '../constants/forms';
import arrayFromObj from 'utils/arrayFromObj';
import { EnvelopeSigningStatus, EnvelopeStatus } from '../@types/envelope';
import { getSigningStatus } from 'utils/envelopes';
import { getSigningStatus as getFormSigningStatus } from 'utils/forms';
import useUser from 'hooks/useUser';
import useUserFromStore from 'hooks/useUserFromStore';
import { AdvisorManager } from '../@types/advisor';
import { FirmAdminManager } from '../@types/firmAdmin';
import {
  startOfDay,
  subDays,
  startOfWeek,
  subWeeks,
  startOfMonth,
  subMonths,
  subYears,
  isAfter,
  isBefore,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfYear,
  eachHourOfInterval,
} from 'date-fns';

const useDashboardData = () => {
  const { authUser, user } = useUser();
  const forms = useSelector((state) => state.forms);
  const clients = useSelector((state) => state.clients);
  const { automations } = useSelector((state) => state.automations);
  const { envelopes } = useSelector((state) => state.envelopes);
  const [dataDaysRange, setDataDaysRange] = useState(0);
  const [period, setPeriod] = useState<'max' | '1d' | '5d' | '1m' | '6m' | '1y'>('1m');
  const clientsArray = useMemo(
    () => arrayFromObj(clients.byId, clients.allIds),
    [clients.byId, clients.allIds]
  );

  const formsArray = useMemo(
    () => arrayFromObj(forms.byId, forms.allIds),
    [forms.byId, forms.allIds]
  );
  const currentUser = useUserFromStore(user?.id, authUser?.role) as
    | FirmAdminManager
    | AdvisorManager;
  const hideGettingStarted = currentUser?.settings?.gettingStarted?.hidden;

  const allClientByDays = useMemo(() => {
    if (dataDaysRange === 0) return clientsArray;
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - dataDaysRange));
    return clientsArray.filter((client) => new Date(client.createdAt) > thirtyDaysAgo);
  }, [clientsArray, dataDaysRange]);

  const newClientsByDays = useMemo(
    () => allClientByDays.filter((client) => !client.isProspect),
    [allClientByDays]
  );
  const newProspectByDays = useMemo(
    () => allClientByDays.filter((client) => client.isProspect),
    [allClientByDays]
  );
  const completedFormsByDays = useMemo(() => {
    if (dataDaysRange === 0)
      return formsArray.filter((form) => form.status === formStatuses.COMPLETED);
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - dataDaysRange));
    return formsArray.filter(
      (form) => new Date(form.createdAt) > thirtyDaysAgo && form.status === formStatuses.COMPLETED
    );
  }, [formsArray, dataDaysRange]);

  const completedEnvelopesByDays = useMemo(() => {
    if (dataDaysRange === 0)
      return envelopes.filter((envelope) => envelope.status === EnvelopeStatus.COMPLETED);
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - dataDaysRange));
    return envelopes.filter(
      (form) =>
        new Date(form.sentAt || '') > thirtyDaysAgo && form.status === formStatuses.COMPLETED
    );
  }, [dataDaysRange, envelopes]);

  const completedAutomationsByDays = useMemo(() => {
    if (dataDaysRange === 0)
      return automations.filter((form) => form.status === automationStatus.COMPLETED);
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - dataDaysRange));
    return automations.filter(
      (automation) =>
        new Date(automation.startedAt) > thirtyDaysAgo &&
        automation.status === automationStatus.COMPLETED
    );
  }, [automations, dataDaysRange]);

  const [isGettingStartedVisible, setIsGettingStartedVisible] = useState(
    !hideGettingStarted || false
  );

  useEffect(() => {
    typeof hideGettingStarted === 'boolean' && setIsGettingStartedVisible(!hideGettingStarted);
  }, [hideGettingStarted]);

  const aumTableData = useMemo(() => {
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const aumByMonth: { [month: string]: number } = {};
    let totalAumTwelveMonthsAgo = 0;

    clientsArray.forEach((client) => {
      const clientCreatedDate = new Date(client.createdAt);
      if (clientCreatedDate >= twelveMonthsAgo) {
        const monthYearKey = `${clientCreatedDate.getMonth() + 1}-${clientCreatedDate
          .getFullYear()
          .toString()
          .slice(2)}`;
        if (!aumByMonth[monthYearKey]) {
          aumByMonth[monthYearKey] = 0;
        }
        aumByMonth[monthYearKey] += Number(client.aum) || 0;
      }
      if (clientCreatedDate < twelveMonthsAgo) {
        totalAumTwelveMonthsAgo += Number(client.aum) || 0;
      }
    });

    const sortedKeys = Object.keys(aumByMonth).sort((a, b) => {
      const [aMonth, aYear] = a.split('-');
      const [bMonth, bYear] = b.split('-');
      return (
        new Date(Number(aYear), Number(aMonth) - 1, 1).getTime() -
        new Date(Number(bYear), Number(bMonth) - 1, 1).getTime()
      );
    });

    const labels = sortedKeys.map((key) => {
      const [month, year] = key.split('-');
      const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
        month: 'short',
      });
      return `${monthName} ${year}`;
    });

    const values = sortedKeys.reduce((acc, key) => {
      acc.push(aumByMonth[key] + (acc[acc.length - 1] || totalAumTwelveMonthsAgo));
      return acc;
    }, [] as number[]);

    return { labels, values };
  }, [clientsArray]);

  const getCustomerGrowthData = useCallback(
    (
      clientType: 'all' | 'prospects' | 'clients',
      period: 'max' | '1d' | '5d' | '1m' | '6m' | '1y' = '1m'
    ) => {
      const today = new Date();
      let startDate: Date;
      let dateFormat: string;
      let getIntervals: (interval: { start: Date; end: Date }) => Date[];

      switch (period) {
        case '1d':
          startDate = startOfDay(subDays(today, 1));
          dateFormat = 'HH:mm';
          getIntervals = ({ start, end }) => eachHourOfInterval({ start, end });

          break;
        case '5d':
          startDate = startOfDay(subDays(today, 5));
          dateFormat = 'MMM d';
          getIntervals = eachDayOfInterval;
          break;
        case '1m':
          startDate = startOfMonth(subMonths(today, 1));
          dateFormat = 'MMM d';
          getIntervals = eachDayOfInterval;
          break;
        case '6m':
          startDate = startOfMonth(subMonths(today, 6));
          dateFormat = 'MMM yy';
          getIntervals = eachWeekOfInterval;
          break;
        case '1y':
          startDate = startOfYear(subYears(today, 1));
          dateFormat = 'MMM yy';
          getIntervals = eachMonthOfInterval;
          break;
        case 'max':
        default:
          startDate = new Date(
            Math.min(...clientsArray?.map((client) => new Date(client?.createdAt)?.getTime()))
          );
          dateFormat = 'yyyy';
          getIntervals = eachYearOfInterval;
          break;
      }

      const filteredClients =
        clientType === 'all'
          ? clientsArray
          : clientsArray?.filter((client) =>
              clientType === 'prospects' ? client?.isProspect : !client?.isProspect
            );

      // Sort clients by creation date
      filteredClients.sort(
        (a, b) => new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
      );

      const intervals = getIntervals({ start: startDate, end: today });
      const labels = intervals.map((date) => format(date, dateFormat));

      const values = intervals.map((intervalDate, index) => {
        const nextIntervalDate = intervals[index + 1] || new Date();
        return filteredClients?.filter((client) => {
          const clientDate = new Date(client?.createdAt);
          return clientDate < nextIntervalDate;
        }).length;
      });

      return { labels, values };
    },
    [clientsArray]
  );

  const clientsGrowthData = useMemo(
    () => getCustomerGrowthData('clients', period),
    [getCustomerGrowthData, period]
  );
  const prospectsGrowthData = useMemo(
    () => getCustomerGrowthData('prospects', period),
    [getCustomerGrowthData, period]
  );

  const envelopesData = useMemo(
    () =>
      envelopes.reduce(
        (acc, envelope) => {
          const status = getSigningStatus(envelope);
          if (!acc[status]) acc[status] = [];
          acc[status].push(envelope);
          return acc;
        },
        {} as { [key in EnvelopeSigningStatus]: any[] }
      ),
    [envelopes]
  );

  const formsData = useMemo(
    () =>
      formsArray.reduce(
        (acc, form: any) => {
          const status = getFormSigningStatus(form);
          if (!acc[status]) acc[status] = [];
          acc[status].push(form);
          return acc;
        },
        {} as { [id: string]: any[] }
      ),
    [formsArray]
  );

  const pendingEnvelopesArray = useMemo(
    () =>
      envelopesData['Awaiting Advisor']?.map((item) => ({
        type: 'envelope',
        data: item,
        date: item?.sentAt || new Date(),
      })),
    [envelopesData]
  );

  const pendingFormsArray = useMemo(
    () => [
      ...(formsData['Awaiting Advisor']?.map((item: any) => ({
        type: 'form',
        data: item,
        date: item?.updatedAt || item?.createdAt || new Date('2021-01-01'),
      })) || []),
      ...(formsData.draft?.map((item: any) => ({
        type: 'draft',
        data: item,
        date: item?.updatedAt || item?.createdAt || new Date('2021-01-01'),
      })) || []),
    ],
    [formsData]
  );

  const pendingActionsArray = useMemo(
    () =>
      [...(pendingEnvelopesArray || []), ...(pendingFormsArray || [])]
        ?.filter((item) => item?.data?.advisorId === authUser?.sub)
        ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [authUser?.sub, pendingEnvelopesArray, pendingFormsArray]
  );

  const dispatch = useDispatch();
  const fetchData = useCallback(() => {
    dispatch(getForms());
    dispatch(getAutomations());
    dispatch(getEnvelopes());
    dispatch(getTemplates());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    user,
    dataDaysRange,
    setDataDaysRange,
    isGettingStartedVisible,
    newClientsByDays,
    newProspectByDays,
    completedFormsByDays,
    completedAutomationsByDays,
    envelopesData,
    clientsGrowthData,
    aumTableData,
    completedEnvelopesByDays,
    prospectsGrowthData,
    formsData,
    pendingActionsArray,
    setPeriod,
    period,
  };
};

export default useDashboardData;
