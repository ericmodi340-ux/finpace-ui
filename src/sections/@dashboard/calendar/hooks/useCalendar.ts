import FullCalendar from '@fullcalendar/react';
import { useRef, useState, useCallback } from 'react';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';

import useResponsive from 'hooks/useResponsive';

import { fTimestamp } from 'utils/formatTime';

import { ICalendarView, ICalendarRange, ICalendarEvent } from '../../../../@types/calendar';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

export default function useCalendar() {
  const calendarRef = useRef<FullCalendar>(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const { user } = useUser();

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null);

  const [view, setView] = useState<ICalendarView>(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView: ICalendarView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg: DateSelectArg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }
      onOpenForm();
      setSelectedRange({
        start: fTimestamp(arg.start),
        end: fTimestamp(arg.end),
      });
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg: EventClickArg) => {
      const { event } = arg;

      onOpenForm();
      setSelectEventId(event.id);
    },
    [onOpenForm]
  );

  const onResizeEvent = useCallback(
    (
      arg: EventResizeDoneArg,
      updateEvent: (
        advisorId: string,
        calendarId: string,
        eventData: Partial<ICalendarEvent>
      ) => void
    ) => {
      const { event } = arg;

      if (!event.start || !event.end) {
        return;
      }

      const data: ICalendarEvent = {
        ...event.extendedProps,
        allDay: event.allDay,
        start: fTimestamp(event.start),
        end: fTimestamp(event.end),
        client: event.extendedProps.client,
        color: event.backgroundColor,
        description: event.extendedProps.description,
        id: event.id,
        title: event.title,
        type: event.extendedProps.type,
        category: event.extendedProps.category,
      };

      updateEvent(user?.id || '', event.id, data);
    },
    [user?.id]
  );

  const onDropEvent = useCallback(
    (
      arg: EventDropArg,
      updateEvent: (
        advisorId: string,
        calendarId: string,
        eventData: Partial<ICalendarEvent>
      ) => void
    ) => {
      const { event } = arg;

      if (!event.start || !event.end) {
        return;
      }

      const data: ICalendarEvent = {
        ...event.extendedProps,
        allDay: event.allDay,
        start: fTimestamp(event.start),
        end: fTimestamp(event.end),
        client: event.extendedProps.client,
        color: event.backgroundColor,
        description: event.extendedProps.description,
        id: event.id,
        title: event.title,
        type: event.extendedProps.type,
        category: event.extendedProps.category,
      };

      updateEvent(user?.id || '', event.id, data);
    },
    [user?.id]
  );

  const onClickEventInFilters = useCallback(
    (eventId: string) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  };
}
