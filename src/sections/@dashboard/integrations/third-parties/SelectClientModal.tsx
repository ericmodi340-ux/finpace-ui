import {
  Avatar,
  ListItemText,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Stack,
  CircularProgress,
  Typography,
} from '@mui/material';

interface SelectClientDialogProps {
  open: boolean;
  onClose: () => void;
  clientList: any[];
  isLoading: boolean;
  onSelect: (id: string) => Promise<void>;
}

export default function SelectClientDialog(props: SelectClientDialogProps) {
  const { onClose, open, clientList, isLoading, onSelect } = props;

  const handleListItemClick = async (value: any) => {
    await onSelect(value?.id);
    onClose();
  };

  return (
    <Dialog maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>Select client account</DialogTitle>
      <DialogContent>
        <DialogContentText>Multiple client accounts found. Please select one.</DialogContentText>
        {isLoading ? (
          <Stack height={70} mt={3} alignItems="center">
            <CircularProgress color="primary" size={30} />
            <Typography mt={1} color="gray">
              Updating Client in CMS
            </Typography>
          </Stack>
        ) : clientList.length === 0 ? null : (
          <List sx={{ mt: 2 }}>
            {clientList.map((client) => (
              <ListItem key={Math.random()} disableGutters>
                <ListItemButton onClick={() => handleListItemClick(client)}>
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText
                    primary={client?.name}
                    secondary={`${client?.email} (${client?.id})`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
