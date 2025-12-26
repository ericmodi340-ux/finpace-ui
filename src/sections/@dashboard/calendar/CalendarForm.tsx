import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { v4 as uuidv4 } from 'uuid';
import { isAfter, fTimestamp } from 'utils/formatTime';

import Iconify from 'components/Iconify';
import { useSnackbar } from 'notistack';
import { ColorPicker } from 'components/color-utils';
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from 'components/hook-form';

import { ICalendarDate, ICalendarEvent } from '../../../@types/calendar';
import { AvatarGroup, Grid, ListItemText, ListSubheader, MenuItem, Avatar } from '@mui/material';
import { useSelector } from 'redux/store';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from 'redux/slices/calendarEvents';
import { Categories, Types } from 'constants/calendar';
import { startCase } from 'lodash';

// ----------------------------------------------------------------------

type Props = {
  colorOptions: string[];
  onClose: VoidFunction;
  currentEvent?: ICalendarEvent;
  userId: string;
};

export default function CalendarForm({ currentEvent, colorOptions, onClose, userId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const clients = useSelector((state) => state.clients);
  const calendar = useSelector((state) => state.firm.firm.settings?.calendar);
  const advisors = useSelector((state) => state.advisors);
  const { isLoading } = useSelector((state) => state.calendarEvents);

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    // not required
    color: Yup.string(),
    allDay: Yup.boolean(),
    start: Yup.mixed(),
    end: Yup.mixed(),
    category: Yup.mixed(),
    type: Yup.mixed(),
    client: Yup.string(),
  });

  const defaultValues = {
    ...currentEvent,
    client: currentEvent?.client?.id || '',
  };

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(EventSchema),
    defaultValues: defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = isAfter(new Date(values.start!!), new Date(values.end!!));

  const onSubmit = handleSubmit(async (data: any) => {
    const eventData: ICalendarEvent = {
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      color: data?.color,
      title: data?.title,
      allDay: data?.allDay,
      description: data?.description,
      end: data?.end,
      start: data?.start,
      client: data?.client
        ? {
            id: data?.client,
            name: clients.byId[data?.client]?.name,
            email: clients.byId[data?.client]?.email,
          }
        : null,
      type: data?.type,
      category: data?.category,
    } as ICalendarEvent;

    try {
      if (!dateError) {
        if (currentEvent?.id) {
          await updateCalendarEvent(userId, currentEvent?.id, eventData);
          enqueueSnackbar('Update success!');
        } else {
          await createCalendarEvent(userId, eventData);
          enqueueSnackbar('Create success!');
        }
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onDelete = useCallback(async () => {
    try {
      if (currentEvent?.id) {
        await deleteCalendarEvent(userId, `${currentEvent.id}`, {
          ...currentEvent,
          status: 'inactive',
        });
      }
      enqueueSnackbar('Delete success!');
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent, enqueueSnackbar, onClose, userId]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3} sx={{ px: 3 }}>
        <Grid xs={12} item>
          <RHFTextField name="title" label="Title" />
        </Grid>

        <Grid xs={12} item>
          <RHFTextField name="description" label="Description" multiline rows={3} />
        </Grid>

        <Grid xs={12} item>
          <RHFSwitch name="allDay" label="All day" />
        </Grid>

        <Grid xs={12} md={6} item>
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <MobileDateTimePicker
                {...field}
                disablePast
                value={new Date(field.value as ICalendarDate)}
                onChange={(newValue) => {
                  if (newValue) {
                    field.onChange(fTimestamp(newValue));
                  }
                }}
                label="Start date"
                format="dd/MM/yyyy hh:mm a"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6} item>
          <Controller
            name="end"
            control={control}
            render={({ field }) => (
              <MobileDateTimePicker
                {...field}
                disablePast
                value={new Date(field.value as ICalendarDate)}
                onChange={(newValue) => {
                  if (newValue) {
                    field.onChange(fTimestamp(newValue));
                  }
                }}
                label="End date"
                format="dd/MM/yyyy hh:mm a"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: dateError,
                    helperText: dateError && 'End date must be later than start date',
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFSelect name="type" defaultValue="" label="Type">
            <MenuItem value="">
              <ListItemText primary="None" />
            </MenuItem>
            {Types.map((type) => (
              <MenuItem key={type} value={type}>
                <ListItemText primary={startCase(type)} />
              </MenuItem>
            ))}
            <ListSubheader>Custom Types</ListSubheader>
            {calendar?.customTypes?.map((name) => (
              <MenuItem key={name} value={name}>
                <ListItemText primary={startCase(name)} />
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>
        <Grid item xs={12} md={6}>
          <RHFSelect name="category" defaultValue="" label="Category">
            <MenuItem value="">
              <ListItemText primary="None" />
            </MenuItem>
            {Categories.map((category) => (
              <MenuItem key={category} value={category}>
                <ListItemText primary={startCase(category)} />
              </MenuItem>
            ))}
            <ListSubheader>Custom Categories</ListSubheader>
            {calendar?.customCategories?.map((name) => (
              <MenuItem key={name} value={name}>
                <ListItemText primary={startCase(name)} />
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>

        <Grid item xs={12}>
          <RHFAutocomplete
            name="client"
            label="Client"
            options={clients.allIds}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => clients.byId[option]?.name || ''}
          />
        </Grid>

        <Grid item xs={9}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                selected={field.value as string}
                onSelectColor={(color) => field.onChange(color as string)}
                colors={colorOptions}
              />
            )}
          />
        </Grid>
        {currentEvent?.advisorId && (
          <Grid item xs={3}>
            <AvatarGroup max={4}>
              <Tooltip title={advisors.byId[currentEvent?.advisorId].name}>
                <Avatar alt={advisors.byId[currentEvent?.advisorId].name}>
                  {advisors.byId[currentEvent?.advisorId].name[0]}
                </Avatar>
              </Tooltip>
            </AvatarGroup>
          </Grid>
        )}
      </Grid>

      <DialogActions>
        {!!currentEvent?.id && (
          <Tooltip title="Delete Event">
            <IconButton disabled={isLoading} onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
