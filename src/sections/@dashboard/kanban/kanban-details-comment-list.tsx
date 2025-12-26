import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import Image from 'components/Image';

import { IKanbanComment } from '../../../@types/kanban';
import { fToNow } from 'utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  comments: IKanbanComment[];
};

export default function KanbanDetailsCommentList({ comments }: Props) {
  return (
    <>
      <Stack
        spacing={3}
        flexGrow={1}
        sx={{
          py: 3,
          px: 2.5,
          bgcolor: 'background.neutral',
        }}
      >
        {comments.map((comment) => (
          <Stack key={comment.id} direction="row" spacing={2}>
            <Avatar src={comment.avatarUrl} />

            <Stack spacing={comment.messageType === 'image' ? 1 : 0.5} flexGrow={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2"> {comment.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fToNow(comment.createdAt)}
                </Typography>
              </Stack>

              {comment.messageType === 'image' ? (
                <Image
                  alt={comment.message}
                  src={comment.message}
                  sx={{
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: (theme) => theme.transitions.create(['opacity']),
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              ) : (
                <Typography variant="body2">{comment.message}</Typography>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </>
  );
}
