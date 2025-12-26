// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Divider, Collapse, Typography } from '@mui/material';
// @types
// components
import Iconify from '../../../components/Iconify';
import { ClientManager } from '../../../@types/client';
import UserAvatar from 'components/UserAvatar';
import { roles } from 'constants/users';
import { UserRole } from '../../../@types/user';

// ----------------------------------------------------------------------

const CollapseButtonStyle = styled(Button)(({ theme }) => ({
  ...theme.typography.overline,
  height: 40,
  borderRadius: 0,
  padding: theme.spacing(1, 2),
  justifyContent: 'space-between',
  color: theme.palette.text.disabled,
}));

const RowStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1.5, 0),
}));

const RowIconStyle = styled(Iconify)(({ theme }) => ({
  width: 16,
  height: 16,
  marginTop: 4,
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const RowTextStyle = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: 160,
  wordWrap: 'break-word',
  ...theme.typography.body2,
}));

// ----------------------------------------------------------------------

type Props = {
  client: ClientManager;
  isCollapse: boolean;
  onCollapse: VoidFunction;
};

export default function ChatRoomOneParticipant({ client, isCollapse, onCollapse }: Props) {
  if (client === undefined) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          pt: 4,
          pb: 3,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <UserAvatar
          user={{
            type: roles.FIRM_ADMIN as UserRole.FIRM_ADMIN,
            id: client.id,
            name: client.name,
            // name,
          }}
          sx={{ width: 96, height: 96 }}
        />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1">{client.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {client.name}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <CollapseButtonStyle
        fullWidth
        color="inherit"
        onClick={onCollapse}
        endIcon={
          <Iconify
            icon={isCollapse ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={16}
            height={16}
          />
        }
      >
        information
      </CollapseButtonStyle>

      <Collapse in={isCollapse}>
        <Box sx={{ px: 2.5, pb: 1 }}>
          {client.advisorId &&
            (client.address || client.city || client.state || client.zipCode) && (
              <RowStyle>
                <RowIconStyle icon={'eva:pin-fill'} />
                <RowTextStyle>{`${client.address || ''} ${client.city || ''} ${
                  client.state || ''
                } ${client.zipCode || ''}`}</RowTextStyle>
              </RowStyle>
            )}
          <RowStyle>
            <RowIconStyle icon={'eva:phone-fill'} />
            <RowTextStyle>{client.phoneNumber}</RowTextStyle>
          </RowStyle>
          <RowStyle>
            <RowIconStyle icon={'eva:email-fill'} />
            <RowTextStyle>{client.email}</RowTextStyle>
          </RowStyle>
        </Box>
      </Collapse>
    </>
  );
}
