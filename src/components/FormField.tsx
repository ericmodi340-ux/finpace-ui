import { FormikTouched, FormikErrors } from 'formik';
// @mui
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Autocomplete,
  Select,
  TextField,
  TextFieldProps,
} from '@mui/material';
// @types
import { FormFieldManager } from '../@types/field';

// ----------------------------------------------------------------------

type FormFieldProps = TextFieldProps & {
  field: FormFieldManager;
  touched: FormikTouched<{ [key: string]: any }>;
  errors: FormikErrors<any>;
  value?: any;
  getFieldProps: ({ name }: { name: string }) => any;
  setFieldValue?: (fieldId: string, value: any) => any;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  helpMessage?: string;
  loading?: boolean;
};

const FormField = ({
  field,
  touched,
  errors,
  getFieldProps,
  value,
  setFieldValue,
  helpMessage,
  loading,
  ...other
}: FormFieldProps) => {
  const { name, label, type, options } = field;
  const labelId = `${name}-label`;

  const error = Boolean(touched[name] && errors[name]);
  const helperText = helpMessage || (touched[name] && errors[name]);

  switch (type) {
    case 'Autocomplete':
      return (
        <FormControl fullWidth error={error}>
          <Autocomplete
            id={name}
            options={
              options?.map((option) => {
                const { value } = option;
                return value;
              }) || []
            }
            getOptionLabel={(optionValue: string) => {
              if (!options) {
                return '';
              }
              const option = options.find((option) => option.value === optionValue);
              return option?.label || optionValue;
            }}
            value={value}
            onChange={(e, value) => (setFieldValue ? setFieldValue(name, value) : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label={label}
                {...getFieldProps({ name })}
                error={error}
                helperText={helperText}
                sx={{ mb: 3 }}
                {...other}
              />
            )}
            loading={loading}
          />
        </FormControl>
      );
    case 'Select':
      return (
        <FormControl fullWidth error={error}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select labelId={labelId} label={label} {...getFieldProps({ name })} error={error}>
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && <FormHelperText>{String(helperText)}</FormHelperText>}
        </FormControl>
      );
    case 'TextField':
      return (
        <TextField
          fullWidth
          label={label}
          {...getFieldProps({ name })}
          error={error}
          helperText={helperText}
          sx={{ mb: 3 }}
          {...other}
        />
      );
    default:
      return <></>;
  }
};

export default FormField;
