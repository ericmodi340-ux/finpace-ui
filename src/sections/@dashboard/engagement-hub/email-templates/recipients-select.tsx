import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import useClientTags from 'hooks/useClientTags';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'redux/store';
import { PATH_DASHBOARD } from 'routes/paths';
import arrayFromObj from 'utils/arrayFromObj';

type Props = DialogProps & {
  onClose: () => void;
  emailTemplateId: string;
};

export default function RecipientsSelectDialog(props: Props) {
  const [selectedClients, setSelectedClients] = useState<{ title: string; value: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { byId } = useSelector((state) => state.clients);
  const clientsArray: any[] = arrayFromObj(byId);
  const tags = useClientTags();
  const navigate = useNavigate();

  const onSend = useCallback(() => {
    navigate(
      PATH_DASHBOARD.engagementHub.emailTemplateSend + '?selectedId=' + props.emailTemplateId
    );
  }, [navigate, props.emailTemplateId]);

  return (
    <Dialog {...props} maxWidth="sm" fullWidth>
      <DialogTitle>Select Recipients</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ mt: 2 }}
          multiple
          options={clientsArray?.map((item) => ({ title: item?.name, value: item?.id }))}
          disableCloseOnSelect
          getOptionLabel={(option) => option?.title || ''}
          renderInput={(params) => <TextField {...params} label="Select Clients" />}
          value={selectedClients}
          onChange={(_, newValue) => {
            setSelectedClients(newValue);
          }}
        />
        <Autocomplete
          multiple
          sx={{ mt: 2 }}
          options={tags}
          getOptionLabel={(option) => option}
          renderInput={(params) => <TextField {...params} label="Select Tags" />}
          value={selectedTags}
          onChange={(_, newValue) => {
            setSelectedTags(newValue);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button variant="contained" onClick={onSend} color="primary">
          Select and Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
