import { Box, Typography, useTheme } from '@mui/material';
import { Handle, Position } from 'reactflow';

export const StartNode = ({ data }: { data: any }) => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          width: 300,
          height: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            background: theme.palette.background.paper,
            border: 1,
            borderColor: theme.palette.grey[400],
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
          }}
        >
          <Typography variant="subtitle1">{data.title}</Typography>
        </Box>
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
