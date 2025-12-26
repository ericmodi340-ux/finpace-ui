import { Autocomplete, Chip, TextField } from '@mui/material';
import { ClientNote } from '../../../@types/client';
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';
import useClientTags from 'hooks/useClientTags';

type TextFieldsProps = {
  getFieldProps: (name: string) => FieldInputProps<any>;
  touched: FormikTouched<Partial<ClientNote>>;
  errors: FormikErrors<Partial<ClientNote>>;
  autocompleteOnChange: (event: React.ChangeEvent<{}>, value: string | string[]) => void;
  values: Partial<ClientNote>;
};
const NotesTextForm: React.FC<TextFieldsProps> = ({
  getFieldProps,
  touched,
  errors,
  autocompleteOnChange,
  values,
}) => {
  const CLIENT_TAGS = useClientTags();
  return (
    <>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Text"
        {...getFieldProps('text')}
        error={Boolean(touched.text && errors.text)}
        helperText={touched.text && errors.text}
      />

      <Autocomplete
        multiple
        freeSolo
        onChange={autocompleteOnChange}
        value={values.tags}
        options={CLIENT_TAGS}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            error={Boolean(touched.tags && errors.tags)}
            helperText={touched.tags && errors.tags}
            placeholder="#Add a tags"
          />
        )}
      />
    </>
  );
};
export default NotesTextForm;
