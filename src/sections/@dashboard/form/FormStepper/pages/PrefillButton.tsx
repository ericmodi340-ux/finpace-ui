import * as React from 'react';
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  ListItemAvatar,
  ListItemText,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Stack,
  Typography,
  Portal,
} from '@mui/material';
import Iconify from 'components/Iconify';
import useIntegrations from 'hooks/useIntegrations';
import { services, statuses } from 'constants/integrations';
import { getServiceName } from 'utils/integrations';
import {
  findAllClientFromIntegrationByEmail,
  importClientFromIntegration,
} from 'redux/slices/clients';
import { IntegrationOwner } from '../../../../../@types/integration';
import { ClientManager } from '../../../../../@types/client';
import { useSnackbar } from 'notistack';

export default function PrefillButton({
  currentClient,
  resetValues,
}: {
  currentClient: ClientManager;
  resetValues: (obj: any) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isSelectClientOpen, setIsSelectClientOpen] = React.useState(false);
  const [clientList, setClientList] = React.useState<any[]>([]);

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { integrations } = useIntegrations();
  const [loading, setLoading] = React.useState(false);

  const handleMenuItemClick = (_: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const filteredIntegrations = integrations?.flatMap((integration, index) => {
    const service = services.find((service) => service.id === integration.id);

    if (
      integration.status === statuses.INACTIVE ||
      !service?.isAvailable ||
      !integration.fields // ? Only integrations with field keys will work with pulling
    ) {
      return [];
    }

    if (service.id === 'wealthbox' || service.id === 'redtail' || service.id === 'salesforce') {
      return integration;
    }

    return [];
  });

  if (!filteredIntegrations?.length) {
    return null;
  }

  const handleClick = async () => {
    const selectedIntegration = filteredIntegrations[selectedIndex];
    setLoading(true);
    const response = await findAllClientFromIntegrationByEmail({
      integrationType: selectedIntegration.id,
      email: currentClient.email,
      integrationOwner: selectedIntegration.integrationOwner as IntegrationOwner,
    }).finally(() => setLoading(false));

    setClientList(response);
    setIsSelectClientOpen(true);
    return;
  };

  return (
    <React.Fragment>
      <ButtonGroup
        sx={{
          flexGrow: 1,
        }}
        color="primary"
        variant="outlined"
        ref={anchorRef}
        aria-label="split button"
      >
        <Button
          size="medium"
          sx={{
            flexGrow: 1,
            minWidth: 120,
            width: '100%',
          }}
          disabled={loading}
          onClick={handleClick}
        >
          {loading ? 'Loading...' : `Import ${filteredIntegrations[selectedIndex]?.id}`}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <Iconify icon="ic:baseline-arrow-drop-down" />
        </Button>
      </ButtonGroup>
      <Portal>
        <Popper
          sx={{
            zIndex: 1,
            backgroundColor: 'background.paper',
          }}
          open={open}
          anchorEl={anchorRef.current}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {filteredIntegrations.map((integration, index) => (
                      <MenuItem
                        key={`${integration.id}${integration.integrationOwner}`}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        <ListItemText sx={{ mr: 5 }}>
                          {getServiceName(integration.id)}{' '}
                        </ListItemText>
                        <Typography
                          variant="body2"
                          textTransform="capitalize"
                          color="text.secondary"
                        >
                          {integration.integrationOwner}
                        </Typography>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Portal>

      {!!filteredIntegrations[selectedIndex] && (
        <SelectClientDialog
          open={isSelectClientOpen}
          onClose={() => setIsSelectClientOpen(false)}
          clientList={clientList}
          currentClient={currentClient}
          selectedIntegration={filteredIntegrations[selectedIndex]}
          resetValues={resetValues}
        />
      )}
    </React.Fragment>
  );
}

interface SelectClientDialogProps {
  open: boolean;
  onClose: () => void;
  clientList: any[];
  currentClient: ClientManager;
  selectedIntegration: any;
  resetValues: (value: any) => void;
}

function SelectClientDialog(props: SelectClientDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { onClose, open, clientList, currentClient, selectedIntegration, resetValues } = props;
  const [loading, setLoading] = React.useState(false);

  const handleListItemClick = async (value: any) => {
    const payload = {
      integrationContactId: value?.id,
      clientId: currentClient.id,
    };
    setLoading(true);
    const response = await importClientFromIntegration({
      integrationType: selectedIntegration?.id,
      integrationOwner: selectedIntegration?.integrationOwner as IntegrationOwner,
      data: payload,
    }).finally(() => setLoading(false));
    resetValues(response);
    enqueueSnackbar('Imported from CMS success!', { variant: 'success' });
    enqueueSnackbar('Please review the imported values and save changes!', {
      variant: 'success',
      autoHideDuration: null,
    });
    onClose();
  };

  return (
    <Dialog maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>
        {clientList.length === 0 ? 'No Client Found' : 'Select client account'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {clientList.length === 0
            ? 'There is no client account associated with the provided client email in this integration.'
            : 'Client accounts found. Please select one.'}
        </DialogContentText>
        {loading ? (
          <Stack height={70} mt={3} alignItems="center">
            <CircularProgress color="primary" size={30} />
            <Typography mt={1} color="gray">
              Importing
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
