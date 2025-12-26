import { Helmet } from 'react-helmet-async';

import { CalendarView } from 'sections/@dashboard/calendar/view';

// ----------------------------------------------------------------------

export default function CalendarPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Calendar</title>
      </Helmet>

      <CalendarView />
    </>
  );
}
