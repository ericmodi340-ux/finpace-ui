import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
// @types
import { Conversation } from '../../../@types/chat';
// components
import { roles } from 'constants/users';
import UserAvatar from 'components/UserAvatar';
import { UserRole } from '../../../@types/user';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(3),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 320,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
}));

const InfoStyle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(0.75),
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

type Props = {
  message: any;
  createdAt: string;
  senderRole?: string;
  conversation?: Conversation;
  onOpenLightbox?: (value: string) => void;
  advisorName?: string;
  userId?: string;
};

export default function ChatMessageItem({
  message,
  createdAt,
  senderRole,
  advisorName,
  userId,
}: Props) {
  const isClient = senderRole === roles.CLIENT;

  return (
    <RootStyle>
      <Box
        sx={{
          display: 'flex',
          ...(isClient && {
            ml: 'auto',
          }),
        }}
      >
        {!isClient && (
          <UserAvatar
            user={{
              type: roles.FIRM_ADMIN as UserRole.FIRM_ADMIN,
              id: userId,
              name: advisorName,
            }}
            sx={{ mr: 2 }}
          />
        )}

        <div>
          <ContentStyle
            sx={{
              ...(isClient && { color: 'grey.800', bgcolor: 'primary.lighter' }),
            }}
          >
            <Typography variant="body2">{message}</Typography>
          </ContentStyle>
          <InfoStyle
            variant="caption"
            sx={{
              ...(isClient && { justifyContent: 'flex-end' }),
            }}
          >
            {!isClient && advisorName}&nbsp;
            {formatDistanceToNowStrict(new Date(createdAt), {
              addSuffix: true,
              roundingMethod: 'floor',
            })}
          </InfoStyle>
        </div>
      </Box>
    </RootStyle>
  );
}
