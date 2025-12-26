import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { isBefore } from 'date-fns';

import useResponsive from 'hooks/useResponsive';

import { DateRangePickerProps } from './types';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function CustomDateRangePicker({
  title = 'Select date range',
  variant = 'input',
  //
  startDate,
  endDate,
  //
  onChangeStartDate,
  onChangeEndDate,
  //
  open,
  onClose,
  //
  error,
}: DateRangePickerProps) {
  const mdUp = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [internalError, setInternalError] = useState(false);

  useEffect(() => {
    if (tempStartDate && tempEndDate) {
      setInternalError(!isBefore(tempStartDate, tempEndDate));
    }
  }, [tempStartDate, tempEndDate]);

  const handleApply = () => {
    if (!internalError) {
      onChangeStartDate(tempStartDate);
      onChangeEndDate(tempEndDate);
      onClose();
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            mdUp && {
              overflow: 'unset',
            }),
        }}
      >
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                }}
              >
                <Typography
                  sx={{
                    mx: 2,
                    mt: 2,
                  }}
                  variant="subtitle2"
                >
                  Start Date
                </Typography>
                <DateCalendar value={tempStartDate} onChange={setTempStartDate} />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                }}
              >
                <Typography
                  sx={{
                    mx: 2,
                    mt: 2,
                  }}
                  variant="subtitle2"
                >
                  End Date
                </Typography>
                <DateCalendar value={tempEndDate} onChange={setTempEndDate} />
              </Paper>
            </>
          ) : (
            <>
              <DatePicker label="Start date" value={tempStartDate} onChange={setTempStartDate} />

              <DatePicker label="End date" value={tempEndDate} onChange={setTempEndDate} />
            </>
          )}
        </Stack>

        {(error || internalError) && (
          <FormHelperText error sx={{ px: 2 }}>
            End date must be later than start date
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button disabled={error || internalError} variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
