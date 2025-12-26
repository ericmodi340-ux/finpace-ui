import { Autocomplete, Chip, styled, TextField, Typography } from '@mui/material';
import { UploadMultiFile } from 'components/upload';
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';
import { ClientNote } from '../../../@types/client';
import useClientTags from 'hooks/useClientTags';

type AttachmentFieldsProps = {
  files: any[];
  handleDrop: (file: any) => void;
  handleRemove: (file: File | string) => void;
  handleRemoveAll: () => void;
  getFieldProps: (name: string) => FieldInputProps<any>;
  touched: FormikTouched<Partial<ClientNote>>;
  errors: FormikErrors<Partial<ClientNote>>;
  values: Partial<ClientNote>;
  autocompleteOnChange: (event: React.ChangeEvent<{}>, value: string | string[]) => void;
};
const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));
const NotesAttachmentForm: React.FC<AttachmentFieldsProps> = ({
  files,
  handleDrop,
  handleRemove,
  handleRemoveAll,
  getFieldProps,
  touched,
  errors,
  values,
  autocompleteOnChange,
}) => {
  const CLIENT_TAGS = useClientTags();

  return (
    <>
      <div>
        <LabelStyle>ADD NOTE</LabelStyle>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Text"
          {...getFieldProps('text')}
          error={Boolean(touched.text && errors.text)}
          helperText={touched.text && errors.text}
        />
      </div>
      <div>
        <LabelStyle>ADD ATTACHMENT</LabelStyle>
        <UploadMultiFile
          showPreview={false}
          accept={{
            'application/pdf': ['.pdf'],
          }}
          note="Only PDFs are allowed"
          files={files}
          multiple={false}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          showButtons={false}
        />
      </div>
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
            placeholder="#Add a tags"
            error={Boolean(touched.tags && errors.tags)}
            helperText={touched.tags && errors.tags}
          />
        )}
      />
    </>
  );
};
export default NotesAttachmentForm;
