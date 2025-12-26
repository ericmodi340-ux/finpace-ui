import { Fragment, Dispatch, SetStateAction } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { WealthboxContact } from '../../../../../@types/wealthbox';

type Props = {
  type: 'pull' | 'push';
  conflictClients: WealthboxContact[];
  selectedContactId: WealthboxContact['id'] | null | undefined;
  handleCancel: VoidFunction;
  handleSelect: Dispatch<SetStateAction<WealthboxContact['id'] | null | undefined>>;
  handleContinue: VoidFunction;
  isLoading?: boolean;
};

export default function WealthboxConflictClientsDialog({
  type,
  conflictClients,
  selectedContactId,
  handleCancel,
  handleSelect,
  handleContinue,
  isLoading,
}: Props) {
  return (
    <Dialog open={!!conflictClients.length} maxWidth="xs">
      <DialogTitle>Which contact should we {type === 'pull' ? 'pull' : 'update'}?</DialogTitle>
      <DialogContent>
        {type === 'push' && (
          <DialogContentText>
            Multiple contacts were found for this email in Wealthbox. Please select which one you'd
            like to update below.{' '}
            <strong>
              All conflicting details for this client in Wealthbox will be overwritten by the values
              in Finpace.
            </strong>
            <br />
            <br />
            This process is not reversible.
          </DialogContentText>
        )}

        {type === 'pull' && (
          <DialogContentText>
            Multiple contacts were found for this email in Wealthbox. Please select which one you'd
            like to pull below.
          </DialogContentText>
        )}

        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {conflictClients.map((contact: WealthboxContact, idx) => (
            <Fragment key={contact.id}>
              <ListItem alignItems="flex-start" disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(contact.id)}
                  selected={selectedContactId === contact.id}
                >
                  <ListItemAvatar>
                    <Avatar alt={contact.name} src={contact.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <>
                        {contact.email_addresses.map((email_address) => (
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {email_address.address}
                            </Typography>
                            {` — ${email_address.kind}`}
                          </>
                        ))}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {idx !== conflictClients.length - 1 && <Divider variant="inset" component="li" />}
            </Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={handleCancel} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={isLoading || !selectedContactId}
          loading={isLoading}
          onClick={handleContinue}
          sx={{ textTransform: 'none' }}
        >
          Yes, {type} client
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
