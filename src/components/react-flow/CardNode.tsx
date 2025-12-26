import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { Handle, MarkerType, Position, useReactFlow } from 'reactflow';
import { useMemo } from 'react';
import { getLayoutedElements } from 'utils/elk';

type Props = {
  data: any;
  selected: boolean;
  type: string;
  id: string;
};

export default function CardNode({ data, selected, type, id }: Props) {
  const theme = useTheme();
  const reactflow = useReactFlow();

  const getStatus = useMemo(() => {
    if (data.status === 'running') {
      return (
        <Chip
          size="small"
          variant="outlined"
          sx={{ minWidth: 100 }}
          icon={<CircularProgress size={12} />}
          label="Running"
          color={'info'}
        />
      );
    }
    if (data.status === 'completed') {
      return (
        <Chip
          size="small"
          sx={{ minWidth: 100 }}
          variant="outlined"
          icon={<Iconify icon="mdi:check" />}
          label="Completed"
          color={'success'}
        />
      );
    }
    return (
      <Chip
        sx={{ minWidth: 100 }}
        size="small"
        variant="outlined"
        label="Pending"
        color={'success'}
      />
    );
  }, [data.status]);

  return (
    <Stack
      width={300}
      height={100}
      border={1}
      borderColor={selected ? theme.palette.info.main : theme.palette.grey[400]}
      borderRadius="5px"
      sx={{
        background: selected ? theme.palette.info.lighter : theme.palette.common.white,
        position: 'relative',
      }}
    >
      <Stack spacing={1} p={1} direction="column">
        <ListItem
          sx={{
            p: 0,
          }}
          secondaryAction={data.status && getStatus}
        >
          <ListItemIcon
            sx={{
              background: theme.palette.common.white,
              border: 1,
              p: 0.5,
              borderRadius: 1,
              borderColor: theme.palette.divider,
              mr: 1,
            }}
          >
            <Iconify sx={{ width: 15, height: 15 }} color={data.iconColor} icon={data.icon} />
          </ListItemIcon>
          <ListItemText primary={data.title} />
        </ListItem>
        <Divider />
        <Typography variant="caption">{data.subTitle}</Typography>
        {type === 'input-card' && (
          <Box
            sx={{
              position: 'absolute',
              top: -35,
              left: 0,
              borderTop: 1,
              borderRight: 1,
              borderLeft: 1,
              borderRadius: 1,
              zIndex: -1,
              px: 1,
              pb: 2,
              borderColor: theme.palette.divider,
              bgcolor: theme.palette.info.lighter,
            }}
          >
            <Typography variant="caption">Input</Typography>
          </Box>
        )}
        {data.isExtendable && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              bottom: -15,
              left: 135,
              background: theme.palette.background.paper,
              border: 1,
              borderColor: theme.palette.divider,
              zIndex: 2222,
              ':hover': {
                background: theme.palette.background.neutral,
              },
            }}
            onClick={() => {
              const nodes = reactflow.getNodes();
              const edges = reactflow.getEdges();
              const newNode = {
                id: `${nodes.length + 1}`,
                type: 'new-card',
                position: {
                  x: 0,
                  y: 0,
                },
                data: {
                  title: 'Custom Node',
                  subTitle: 'Please add a new workflow here',
                },
              };
              const edge = edges.find((item) => item.source === id);
              if (!edge) return;
              const newEdge = {
                id: `${edges.length + 1}`,
                source: `${newNode.id}`,
                target: `${edge.target}`,
                type: 'smoothstep',
                animated: true,
                sourceHandle: 'buttom-source',
                targetHandle: 'top-target',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
                style: {
                  strokeWidth: 2,
                },
              };
              const newEdges = edges
                .map((item) => {
                  if (item.source === id) {
                    return {
                      ...item,
                      target: newNode.id,
                    };
                  }
                  return item;
                })
                .concat(newEdge);
              getLayoutedElements([...nodes, newNode], newEdges, {
                'elk.direction': 'DOWN',
              }).then(({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
                reactflow.setNodes(layoutedNodes);
                reactflow.setEdges(layoutedEdges);
              });
            }}
          >
            <Iconify icon="mdi:plus" width={15} height={15} />
          </IconButton>
        )}
      </Stack>

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
