import React, { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  DialogProps,
  ListItemAvatar,
  Stack,
  Avatar,
} from '@mui/material';
import { useSelector } from 'redux/store';
import arrayFromObj from 'utils/arrayFromObj';
import UserAvatar from 'components/UserAvatar';
import { UserRole } from '../../../../@types/user';
import { shareTemplateWithAdvisor } from 'redux/slices/engagement-hub';
import { EmailTemplate } from '../../../../@types/engagementHub';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

type Props = DialogProps & {
  onClose: () => void;
  data: EmailTemplate;
};

export default function ShareWithAdvisorModal(props: Props) {
  const { onClose, data, ...rest } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { byId: advisorsById } = useSelector((state) => state.advisors);
  const { byId: firmAdminsById } = useSelector((state) => state.firmAdmins);

  const advisors: any[] = arrayFromObj(advisorsById);
  const firmAdmins: any[] = arrayFromObj(firmAdminsById);

  const users = useMemo(() => {
    const uniqueUsers = new Map<number, any>();

    [...advisors, ...firmAdmins].forEach((item) => {
      if (!uniqueUsers.has(item.id)) {
        uniqueUsers.set(item.id, {
          ...item,
          role: item.isFirmAdmin ? UserRole.FIRM_ADMIN : UserRole.ADVISOR,
        });
      }
    });

    return Array.from(uniqueUsers.values());
  }, [advisors, firmAdmins]);

  const [selectedAdvisors, setSelectedAdvisors] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

  const handleToggle = useCallback((id: number) => {
    setSelectedAdvisors((prevSelectedAdvisors) => ({
      ...prevSelectedAdvisors,
      [id]: !prevSelectedAdvisors[id],
    }));
  }, []);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedAdvisors = advisors.reduce(
      (acc, advisor) => {
        acc[advisor.id] = event.target.checked;
        return acc;
      },
      {} as { [key: number]: boolean }
    );

    setSelectedAdvisors(newSelectedAdvisors);
    setSelectAll(event.target.checked);
  };

  const onSubmit = async () => {
    const advisorsArray = Object.keys(selectedAdvisors).map((key) => key);
    // @ts-ignore
    const selectedAdvisorsArray = advisorsArray.filter((advisor) => selectedAdvisors[advisor]);

    setIsSubmitting(true);
    try {
      await shareTemplateWithAdvisor({
        advisorId: data.advisorId || '',
        templateId: data.emailTemplateId,
        advisors: selectedAdvisorsArray,
      });
      onClose();
      enqueueSnackbar('Template shared successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error sharing template', { variant: 'error' });
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog {...rest} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          pb: 2,
        }}
      >
        Select Advisors
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          height: 400,
          position: 'relative',
        }}
      >
        <Stack
          sx={{
            backgroundColor: (theme) => theme.palette.background.neutral,
            px: 2,
            py: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <ListItem
            disableGutters
            secondaryAction={
              <Checkbox checked={selectAll} onChange={handleSelectAll} name="selectAll" />
            }
          >
            <ListItemText primary={`Advisors (${users.length})`} />
          </ListItem>
        </Stack>
        <List>
          {users.map((advisor) => (
            <ListItem
              key={advisor?.id}
              secondaryAction={
                <Checkbox
                  onClick={() => handleToggle(advisor?.id)}
                  checked={!!selectedAdvisors[advisor?.id]}
                  tabIndex={-1}
                  disableRipple
                />
              }
            >
              <ListItemText primary={advisor?.name} secondary={advisor?.role} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <LoadingButton
          loading={isSubmitting}
          onClick={onSubmit}
          variant="contained"
          color="primary"
        >
          Confirm
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
