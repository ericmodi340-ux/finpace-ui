// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import {
  Autocomplete,
  AutocompleteProps,
  FilledInputProps,
  OutlinedInputProps,
  TextField,
  InputProps,
} from '@mui/material';

// ----------------------------------------------------------------------

interface Props<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  freeSoloCreate?: boolean;
  InputProps?: Partial<FilledInputProps> | Partial<OutlinedInputProps> | Partial<InputProps>;
}

export default function RHFAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  name,
  label,
  helperText,
  multiple,
  freeSoloCreate,
  InputProps,
  ...other
}: Omit<Props<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          multiple={multiple}
          renderInput={(params) => (
            <TextField
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
              {...(!multiple && freeSoloCreate
                ? {
                    onChange: (event) =>
                      setValue(name, event.target.value, { shouldValidate: true }),
                  }
                : {})}
              {...params}
              InputProps={{ ...params.InputProps, ...InputProps }}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
