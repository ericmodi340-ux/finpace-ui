import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useClientTags } from 'hooks/useClientTags';
import { RHFAutocomplete } from 'components/hook-form';
import FormProvider from 'components/hook-form/FormProvider';
import { LoadingButton } from '@mui/lab';

type AssignTagsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (tags: string[]) => void;
  loading: boolean;
};

const AssignTagsModal = ({ open, onClose, onSubmit, loading = false }: AssignTagsModalProps) => {
  const methods = useForm<{ tags: string[] }>({
    defaultValues: { tags: [] },
  });
  const CLIENT_TAGS = useClientTags();

  const { handleSubmit, watch } = methods;

  const handleFormSubmit = (data: { tags: string[] }) => {
    onSubmit(data.tags);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Select Tags</DialogTitle>
        <DialogContent>
          <RHFAutocomplete
            name="tags"
            label="Tags"
            multiple
            freeSolo
            freeSoloCreate
            sx={{ mt: 2 }}
            options={CLIENT_TAGS}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={`${option}firstInvestor`}
                  size="small"
                  label={option}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            disabled={!watch('tags').length}
            variant="contained"
            loading={loading}
            onClick={handleSubmit(handleFormSubmit)}
          >
            Assign Tags
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default AssignTagsModal;
