import { useEffect, useRef } from 'react';
// @types
//
import Scrollbar from '../../../components/Scrollbar';
import ChatMessageItem from './ChatMessageItem';
import { SendSmsType } from '../../../@types/sms';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import { getAdvisorName } from 'utils/advisors';
import { AdvisorManager } from '../../../@types/advisor';

// ----------------------------------------------------------------------

type Props = {
  sms: SendSmsType[];
};

export default function ChatMessageList({ sms }: Props) {
  const { user, authUser } = useUser();
  const type = authUser?.role;
  const userId = user?.id;
  let advisorName: string;
  if (type === roles.ADVISOR) advisorName = getAdvisorName(user as AdvisorManager);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scrollMessagesToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    scrollMessagesToBottom();
  }, [sms]);

  return (
    <Scrollbar scrollableNodeProps={{ ref: scrollRef }} sx={{ p: 3, height: 1 }}>
      {sms.map((message, index) => (
        <ChatMessageItem
          key={index}
          message={message.message}
          // @ts-ignore
          createdAt={message.createdAt}
          // @ts-ignore
          senderRole={message.senderRole}
          advisorName={advisorName}
          userId={userId}
        />
      ))}
    </Scrollbar>
  );
}
