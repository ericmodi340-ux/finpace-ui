import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Box, Divider, Stack } from '@mui/material';
// redux
import { useSelector } from '../../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
//
import ChatRoom from './ChatRoom';
import ChatMessageList from './ChatMessageList';
import ChatHeaderDetail from './ChatHeaderDetail';
import ChatMessageInput from './ChatMessageInput';
import { find } from 'lodash';
import { SnackbarKey } from 'notistack';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

type Props = {
  chatSubmithandler: (message: string) => Promise<SnackbarKey | undefined>;
};

const ChatWindow = ({ chatSubmithandler }: Props) => {
  const { pathname } = useLocation();
  const { sms } = useSelector((state) => state.firmAdmins);
  const { authUser } = useUser();

  // Get user and client
  const { clientId = '' } = useParams();
  const clients = useSelector((state) => state.clients);
  const client = find(clients.byId, (client) => client.id === clientId)!!;

  const userRole = authUser?.role;
  const clientAdvisor = useSelector((state) => state.advisor.advisor);

  return (
    <Stack sx={{ flexGrow: 1, minWidth: '1px' }}>
      <ChatHeaderDetail clientId={clientId} user={client || clientAdvisor} type={userRole} />

      <Divider />

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Stack sx={{ flexGrow: 1 }}>
          <ChatMessageList sms={sms} />

          <Divider />

          <ChatMessageInput
            onSend={chatSubmithandler}
            disabled={pathname === PATH_DASHBOARD.chat.new}
          />
        </Stack>
        <ChatRoom client={client || clientAdvisor} />
      </Box>
    </Stack>
  );
};

export default ChatWindow;
