// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextField, TextFieldProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  mask?: (value: string) => string;
};

export default function RHFTextField({ name, mask, helperText, type, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={field.value}
          type={type}
          onChange={(e) => {
            if (type === 'number') {
              const { value } = e.target;
              field.onChange(value === '' ? null : Number(value));
            } else {
              mask !== undefined
                ? field.onChange(`${mask(e.target.value)}`)
                : field.onChange(e.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}
