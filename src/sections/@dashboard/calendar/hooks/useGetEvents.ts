import useUser from 'hooks/useUser';
import { useEffect, useMemo } from 'react';
import { getCalendarEvents } from 'redux/slices/calendarEvents';
import { useSelector } from 'redux/store';

export default function useGetEvents(additionalAdvisors: string[] = []) {
  const { calendarEvents, error, isLoading } = useSelector((state) => state.calendarEvents);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      getCalendarEvents(user.id, additionalAdvisors);
    }
  }, [user?.id, additionalAdvisors]);

  const memoizedValue = useMemo(() => {
    const events = calendarEvents.map((event) => ({
      ...event,
      textColor: event.color,
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsEmpty: !isLoading && !calendarEvents?.length,
    };
  }, [calendarEvents, error, isLoading]);

  return memoizedValue;
}
