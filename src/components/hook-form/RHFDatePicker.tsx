// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

type Props = DatePickerProps<Date> & {
  name: string;
  label?: string;
};

export default function RHFDatePicker({ name, label, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          {...other}
          {...field}
          value={field.value ? new Date(field.value) : undefined}
          onChange={(date) => field.onChange(date)}
          format="MM/dd/yyyy"
          slotProps={{
            textField: {
              label: label,
              error: !!fieldState.error,
              helperText: fieldState.error ? fieldState.error?.message : '',
              fullWidth: true,
            },
          }}
        />
      )}
    />
  );
}
