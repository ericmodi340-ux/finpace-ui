import { IconButton, ListItem, ListItemText, Stack, useTheme, ListItemIcon } from '@mui/material';
import { DASHBOARD_HEADER_MOBILE } from 'config';
import AutomationDrawer from './AutomationDrawer';
import ReactFlow, { Background, BackgroundVariant, Controls, ReactFlowProps } from 'reactflow';
import Iconify from 'components/Iconify';
import CardNode from 'components/react-flow/CardNode';

import 'reactflow/dist/style.css';
import { StartNode } from 'components/react-flow/StartNode';

type Props = {
  title: string;
  icon: string;
  iconColor?: string;
  reactFlowProps: ReactFlowProps;
  onClose: () => void;
  children: React.ReactNode;
};

const nodeTypes = {
  card: CardNode,
  start: StartNode,
  'input-card': CardNode,
  'new-card': CardNode,
};

export default function AutomationFlow({
  title,
  icon,
  iconColor,
  reactFlowProps,
  onClose,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Stack
        flexDirection="row"
        px={{ xs: 0, md: 1 }}
        borderBottom={1}
        borderColor={theme.palette.divider}
        bgcolor={theme.palette.background.paper}
        justifyContent="space-between"
        alignItems="center"
        height={DASHBOARD_HEADER_MOBILE}
      >
        <ListItem
          secondaryAction={
            <IconButton onClick={() => onClose()} edge="end" aria-label="close">
              <Iconify icon="eva:close-fill" />
            </IconButton>
          }
        >
          <ListItemIcon>
            <Iconify sx={{ width: 24, height: 24 }} icon={icon} color={iconColor} />
          </ListItemIcon>
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              variant: 'subtitle1',
            }}
          />
        </ListItem>
      </Stack>
      <Stack
        flexDirection={'row'}
        sx={{
          height: `calc(100vh - ${DASHBOARD_HEADER_MOBILE}px)`,
        }}
      >
        <AutomationDrawer>{children}</AutomationDrawer>
        <Stack
          flexGrow={1}
          display={{ xs: 'none', md: 'flex' }}
          sx={{
            background: theme.palette.grey[200],
          }}
        >
          <ReactFlow nodeTypes={nodeTypes} fitView {...reactFlowProps}>
            <Background
              variant={BackgroundVariant.Dots}
              color={theme.palette.divider}
              gap={3}
              size={1}
            />
            <Controls />
          </ReactFlow>
        </Stack>
      </Stack>
    </div>
  );
}
