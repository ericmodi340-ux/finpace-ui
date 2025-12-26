import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useEffect } from 'react';
import { getSms, publishSms } from 'redux/slices/firmAdmins';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import { SendSmsType } from '../../../../@types/sms';
import { useSnackbar } from 'notistack';
import './scoped-styles.scss';
import { Card } from '@mui/material';
import { AdvisorManager } from '../../../../@types/advisor';
import { ChatWindow } from 'sections/@dashboard/chat';

type ClientSmsProps = {
  advisorId: string;
  clientId: string;
  clientPhone: string;
  advisor?: AdvisorManager | null;
};

export const ClientSMS = ({ clientId, advisorId, clientPhone, advisor }: ClientSmsProps) => {
  const { authUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const isFirmAdmin = authUser?.role === roles.FIRM_ADMIN;
  const isAdvisor = authUser?.role === roles.ADVISOR;

  useEffect(() => {
    const fetchSms = () => {
      isFirmAdmin || isAdvisor ? getSms(clientId) : getSms(advisorId);
    };

    fetchSms();
    const intervalId = setInterval(fetchSms, 5000);

    return () => clearInterval(intervalId);
  }, [advisorId, isAdvisor, clientId, isFirmAdmin]);

  const chatSubmitHandler = async (message: string) => {
    try {
      if (!message) return enqueueSnackbar('Add message to sent', { variant: 'error' });
      if (message.length > 160)
        return enqueueSnackbar('The maximum character count is 160', { variant: 'error' });
      const SMS: SendSmsType = {
        // If firmAdmin/advisor the recipient ID = client
        // Else the sender is the client so the recipient is the advisor
        recipientId: isFirmAdmin || isAdvisor ? clientId : advisorId,
        recipientPhoneNumber: isFirmAdmin || isAdvisor ? clientPhone : advisor?.phoneNumber!!,
        message: message,
        // If the sender is the firmAdmin need to send the advisorId
        ...(isFirmAdmin ? { advisorId: advisorId } : {}),
      };
      publishSms(SMS);
      enqueueSnackbar('Message sent', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <>
      <Card sx={{ height: '72vh', display: 'flex' }}>
        <ChatWindow chatSubmithandler={chatSubmitHandler} />
      </Card>
    </>
  );
};
