import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import useResponsive from 'hooks/useResponsive';

import { fDate } from 'utils/formatTime';

import Iconify from 'components/Iconify';

import { ICalendarFilterValue, ICalendarFilters, ICalendarView } from '../../../@types/calendar';
import { Popover, Grid, Checkbox, ListItemText } from '@mui/material';
import { useCallback, useState } from 'react';
import { useSelector } from 'redux/store';
import { AdvisorManager } from '../../../@types/advisor';
import arrayFromObj from 'utils/arrayFromObj';
import { startCase } from 'lodash';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  {
    value: 'dayGridMonth',
    label: 'Month',
    icon: 'mingcute:calendar-month-line',
  },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  {
    value: 'listWeek',
    label: 'Agenda',
    icon: 'fluent:calendar-agenda-24-regular',
  },
] as const;

// ----------------------------------------------------------------------

type Props = {
  date: Date;
  view: ICalendarView;
  loading: boolean;
  onToday: VoidFunction;
  onNextDate: VoidFunction;
  onPrevDate: VoidFunction;
  onOpenFilters: VoidFunction;
  onChangeView: (newView: ICalendarView) => void;
  filters: ICalendarFilters;
  onFilters: (name: string, value: ICalendarFilterValue) => void;
};

export default function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenFilters,
  filters,
  onFilters,
}: Props) {
  const smUp = useResponsive('up', 'sm');
  const { authUser } = useUser();
  const advisors = useSelector((state) => state.advisors);
  const advisorsArray = arrayFromObj(advisors.byId, advisors.allIds) as AdvisorManager[];
  const [viewAnchorEl, setViewAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [advisorsAnchorEl, setAdvisorsAnchorEl] = useState<HTMLButtonElement | null>(null);

  const viewOpen = Boolean(viewAnchorEl);
  const advisorsOpen = Boolean(advisorsAnchorEl);

  const selectedView = VIEW_OPTIONS.filter((item) => item.value === view)[0];
  const selectedAdvisors = advisorsArray
    .filter((item) => filters.additionalAdvisors.includes(item.id))
    .map((item) => item.id);

  const handleFilterAdvisors = useCallback(
    (value: string[]) => {
      onFilters('additionalAdvisors', value);
    },
    [onFilters]
  );

  return (
    <>
      <Grid spacing={2} container sx={{ p: 2.5, pr: 2, position: 'relative' }}>
        <Grid item xs={12} sm={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {smUp && (
              <Button
                size="small"
                color="inherit"
                onClick={(e) => setViewAnchorEl(e.currentTarget)}
                startIcon={<Iconify icon={selectedView.icon} />}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
              >
                {selectedView.label}
              </Button>
            )}
            {authUser?.role === roles.FIRM_ADMIN && (
              <Button
                size="small"
                color="inherit"
                onClick={(e) => setAdvisorsAnchorEl(e.currentTarget)}
                startIcon={<Iconify icon="gridicons:user" />}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
              >
                {selectedAdvisors.length ? `${selectedAdvisors.length + 1} Advisors` : 'My Events'}
              </Button>
            )}
          </Stack>
        </Grid>

        <Grid item xs={8} sm={4}>
          <Stack direction="row" alignItems="center" justifyContent={{ sm: 'center' }} spacing={1}>
            <IconButton onClick={onPrevDate}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>

            <Typography variant="h6">{fDate(date)}</Typography>

            <IconButton onClick={onNextDate}>
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          </Stack>
        </Grid>

        <Grid item xs={4} sm={4}>
          <Stack direction="row" alignItems="center" justifyContent="end" spacing={1}>
            <Button size="small" color="error" variant="contained" onClick={onToday}>
              Today
            </Button>

            <IconButton onClick={onOpenFilters}>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Stack>
        </Grid>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{
              height: 2,
              width: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          />
        )}
      </Grid>

      <Popover
        open={viewOpen}
        anchorEl={viewAnchorEl}
        onClose={() => setViewAnchorEl(null)}
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              setViewAnchorEl(null);
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </Popover>

      <Popover
        open={advisorsOpen}
        anchorEl={advisorsAnchorEl}
        onClose={() => setAdvisorsAnchorEl(null)}
        sx={{ width: 300, height: 400 }}
      >
        <MenuItem disabled>
          <Checkbox checked={true} />
          <ListItemText primary="Me" />
        </MenuItem>
        {advisorsArray.map((advisor) => (
          <MenuItem
            key={advisor.id}
            onClick={() => {
              handleFilterAdvisors(
                filters.additionalAdvisors.includes(advisor.id)
                  ? filters.additionalAdvisors.filter((item) => item !== advisor.id)
                  : [...filters.additionalAdvisors, advisor.id]
              );
            }}
          >
            <Checkbox checked={selectedAdvisors.includes(advisor.id)} />
            <ListItemText primary={startCase(advisor.name) || advisor.email} />
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}
