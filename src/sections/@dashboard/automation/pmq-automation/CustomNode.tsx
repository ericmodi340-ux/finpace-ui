import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { Handle, Position } from 'reactflow';

type Props = {
  data: {
    title: string;
    icon: string;
    iconColor: string;
    subTitle: string;
    handleDirection: Position;
  };
  selected: any;
};

export default function CustomNode({ data, selected }: Props) {
  const theme = useTheme();

  return (
    <Stack
      width={300}
      border={2}
      borderColor={selected ? theme.palette.info.main : theme.palette.grey[400]}
      borderRadius="5px"
      sx={{
        background: selected ? theme.palette.info.lighter : theme.palette.common.white,
      }}
      alignItems="center"
      flexDirection="row"
    >
      <ListItem
        secondaryAction={
          <IconButton edge="end" aria-label="menu">
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            sx={{
              background: theme.palette.common.white,
              border: 1,
              borderColor: theme.palette.divider,
            }}
          >
            <Iconify sx={{ width: 24, height: 24 }} color={data.iconColor} icon={data.icon} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={data.title} secondary={data.subTitle} />
      </ListItem>

      <Handle
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        id="top-target"
        position={Position.Top}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        id="buttom-target"
        position={Position.Bottom}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="buttom-source"
        style={{
          opacity: 0,
        }}
      />
    </Stack>
  );
}

export const Start = ({ data }: { data: any }) => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          width: 100,
          height: 100,
          background: theme.palette.background.paper,
          borderRadius: '50%',
          border: 1,
          borderColor: theme.palette.grey[400],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1">{data.title}</Typography>
      </Box>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        id="top-target"
        position={Position.Top}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        id="buttom-target"
        position={Position.Bottom}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          opacity: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="buttom-source"
        style={{
          opacity: 0,
        }}
      />
    </>
  );
};
