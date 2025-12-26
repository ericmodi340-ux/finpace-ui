import { Box, Container, Dialog, DialogTitle, Stack, styled } from '@mui/material';
import { ClientNote, ClientsState } from '../../../@types/client';
import { Form, FormikProvider, useFormik } from 'formik';
import { FC, useCallback, useState } from 'react';
import { NotesAttachmentForm } from '.';
import useUser from 'hooks/useUser';
import { useSnackbar } from 'notistack';
import { createAttachments, createClientMeetingNote, createClientNote } from 'redux/slices/client';
import { LoadingButton } from '@mui/lab';
import FormField from 'components/FormField';
import { useSelector } from 'redux/store';
import { toArray } from 'lodash';
import { FormFieldManager } from '../../../@types/field';

const GradientTitle = styled(DialogTitle)({
  background: 'linear-gradient(77deg, rgba(0,95,119,1) 0%, rgba(9,225,192,1) 100%);',
  textAlign: 'center',
  color: '#fff',
  padding: '1rem',
});

type props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  clientId: string;
  folder?: string;
};

const CreateNotesFormModal: FC<props> = ({ open, setOpen, clientId, folder = 'Case Notes' }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();
  const { byId: clients } = useSelector((state) => state.clients) as ClientsState;
  const [files, setFiles] = useState<File[]>([]);

  const initialValues: Partial<ClientNote> = {
    text: '',
    tags: [],
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (note, { resetForm }) => {
      await handleFinish(note);
      setOpen(false);
      resetForm();
    },
  });

  const { getFieldProps, errors, values, touched, handleSubmit, isSubmitting, setFieldValue } =
    formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      let newFiles: File[] = [];

      newFiles = acceptedFiles.flatMap((acceptedFile: File) => {
        // Check file hasn't already been uploaded
        let fileExists = files.find((file: File) => file.name === acceptedFile.name);
        if (fileExists) {
          enqueueSnackbar('File already exists', { variant: 'warning' });
          return [];
        }

        return Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        });
      });

      if (newFiles.length) {
        setFiles([...newFiles]);
      }
    },
    [files, enqueueSnackbar]
  );

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleRemove = (file: File | string) => {
    const filteredItems = files.filter((_file) => _file !== file);
    setFiles(filteredItems);
  };

  const uploadFile = async () => {
    try {
      if (user?.firmId) {
        const response = await createAttachments(
          user?.firmId,
          folder === 'Case Notes' ? 'case-notes' : 'meeting-notes',
          files
        );
        setFiles([]);
        enqueueSnackbar('Attachment uploaded', {
          variant: 'success',
        });
        return response;
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (err: any) {
      console.error('Error uploading the note', err);
      enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const autocompleteOnChange = (_event: React.ChangeEvent<{}>, value: string | string[]) => {
    setFieldValue('tags', value);
  };

  const handleFinish = async (note: Partial<ClientNote>) => {
    // Get clientId from parent component or dropdown(when in docuvault)
    const clientIdValue = clientId || values?.clientId;

    const newNote = {
      ...note,
    };

    if (files.length > 0) {
      const attachmentUrl = await uploadFile();
      if (attachmentUrl) {
        newNote.attachmentUrl = attachmentUrl[0].key;
      }
    }

    if (clientIdValue) {
      folder === 'Case Notes'
        ? await createClientNote(clientIdValue, newNote)
        : await createClientMeetingNote(clientIdValue, newNote);
      enqueueSnackbar(`Note created successfully`, {
        variant: 'success',
      });
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
      <GradientTitle>Add {folder === 'Case Notes' ? 'Case' : 'Meeting'} Note</GradientTitle>
      <Container sx={{ mt: 2 }}>
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit}>
            {!clientId && (
              <FormField
                field={
                  {
                    name: 'clientId',
                    label: 'client',
                    type: 'Autocomplete',
                    options: toArray(clients).map((client) => ({
                      value: client.id,
                      label: client.name,
                    })),
                  } as FormFieldManager
                }
                value={values.clientId}
                touched={touched}
                errors={errors}
                getFieldProps={getFieldProps}
                setFieldValue={setFieldValue}
                data-test="form-select-clientId-input"
              />
            )}
            <Stack direction={{ xs: 'column' }} spacing={2}>
              <NotesAttachmentForm
                {...{
                  files,
                  handleDrop,
                  handleRemove,
                  handleRemoveAll,
                  getFieldProps,
                  touched,
                  errors,
                  values,
                  autocompleteOnChange,
                }}
              />
            </Stack>
            <Box sx={{ py: 3, display: 'flex' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || (values.text?.length === 0 && files.length === 0)}
                loading={isSubmitting}
                sx={{ flex: 1 }}
              >
                Save
              </LoadingButton>
            </Box>
          </Form>
        </FormikProvider>
      </Container>
    </Dialog>
  );
};

export default CreateNotesFormModal;
