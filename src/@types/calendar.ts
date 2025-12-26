// ----------------------------------------------------------------------

export type CalendarState = {
  isLoading: boolean;
  error: Error | string | null;
  calendarEvents: ICalendarEvent[];
};

export type ICalendarFilterValue = string[] | Date | null;

export type ICalendarFilters = {
  colors: string[];
  startDate: Date | null;
  endDate: Date | null;
  category: string[];
  type: string[];
  additionalAdvisors: string[];
};

// ----------------------------------------------------------------------

export type ICalendarDate = string | number | Date;

export type ICalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export type ICalendarRange = {
  start: ICalendarDate;
  end: ICalendarDate;
} | null;

export type ICalendarEvent = {
  id: string;
  color: string;
  title: string;
  allDay: boolean;
  description: string;
  end: ICalendarDate;
  start: ICalendarDate;
  client: ICalendarClient | null;
  type: string;
  category: string;
  status?: 'active' | 'inactive';
  advisorId?: string;
};

export type ICalendarClient = {
  id: string;
  name: string;
  email: string;
};
