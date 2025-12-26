import { FormikTouched, FormikErrors, getIn } from 'formik';
// @mui
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
// @types
import { FormFieldManager } from '../@types/field';

// ----------------------------------------------------------------------

type FormFieldArrayFieldProps = {
  name: string;
  index: number;
  parent: string;
  fields: FormFieldManager[];
  touched: FormikTouched<{ [key: string]: any }>;
  errors: FormikErrors<any>;
  getFieldProps: ({ name }: { name: string }) => any;
};

const FormFieldArrayField = ({
  name,
  index,
  parent,
  fields,
  touched,
  errors,
  getFieldProps,
}: FormFieldArrayFieldProps) => {
  const field = fields.find((field) => field.name === name);
  const { label, type, options } = field as FormFieldManager;

  const subfieldName = `${parent}[${index}].${name}`;
  const touchedField = getIn(touched, subfieldName);
  const errorField = getIn(errors, subfieldName);

  const error = Boolean(touchedField && errorField);
  const helperText = touchedField && errorField ? errorField : '';

  switch (type) {
    case 'Select':
      const labelId = `${parent}-${name}-label`;

      return (
        <FormControl
          fullWidth
          error={error}
          sx={{
            minWidth: '200px',
            position: 'relative',
          }}
        >
          <InputLabel id={labelId}>Role</InputLabel>
          <Select labelId={labelId} label={label} {...getFieldProps({ name: subfieldName })}>
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && (
            <FormHelperText sx={{ position: 'absolute', bottom: '-23px' }}>
              {errorField}
            </FormHelperText>
          )}
        </FormControl>
      );
    case 'TextField':
      return (
        <FormControl
          fullWidth
          error={error}
          sx={{
            position: 'relative',
            minWidth: '250px',
          }}
        >
          <TextField
            fullWidth
            label={label}
            {...getFieldProps({ name: subfieldName })}
            error={error}
          />
          <FormHelperText sx={{ position: 'absolute', bottom: '-23px' }}>
            {helperText}
          </FormHelperText>
        </FormControl>
      );
    default:
      return <></>;
  }
};

export default FormFieldArrayField;
