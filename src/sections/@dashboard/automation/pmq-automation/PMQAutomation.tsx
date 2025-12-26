import { IconButton, Stack, useTheme } from '@mui/material';
import LogoIcon from 'components/LogoIcon';
import { DASHBOARD_HEADER_MOBILE } from 'config';
import ReactFlow, { Background, BackgroundVariant, Controls, MarkerType } from 'reactflow';

import 'reactflow/dist/style.css';
import AutomationDrawer from './AutomationDrawer';
import CustomNode, { Start } from './CustomNode';
import Iconify from 'components/Iconify';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';

const initialNodes = [
  {
    id: 'start12',
    type: 'start',
    position: { x: -200, y: 5 },
    data: {
      title: 'Start',
    },
  },
  {
    id: 'start',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      title: 'Calendly Invitee',
      subTitle: 'When a client is added on finpace a new calendly invite is sent',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
    },
  },
  {
    id: 'note',
    type: 'custom',
    position: { x: 230, y: -130 },
    data: {
      title: 'Pre-Meeting Notes',
      subTitle: 'Create or view notes for each client based on available data',
      icon: 'icon-park:notes',
    },
  },
  {
    id: 'meeting',
    type: 'custom',
    position: { x: 430, y: 10 },
    data: {
      title: 'Meeting Day',
      subTitle: 'Pre-meeting notes help guide the conversation.',
      icon: 'mdi:virtual-meeting',
      iconColor: '#483285',
    },
  },
  {
    id: 'post-note',
    type: 'custom',
    position: { x: 660, y: 130 },
    data: {
      title: 'Post-Meeting Notes',
      subTitle: 'Create post meeting notes based on takeaways from the discussion',
      icon: 'icon-park:notes',
    },
  },
  {
    id: 'form',
    type: 'custom',
    position: { x: 860, y: 10 },
    data: {
      title: 'Suitability Assessment',
      subTitle: 'Client will fill out suitability assessment.',
      icon: 'bxs:report',
      iconColor: '#483285',
    },
  },
  {
    id: 'second-calendly',
    type: 'custom',
    position: { x: 1210, y: 0 },
    data: {
      title: 'Calendly Invitee',
      subTitle: 'Calendly invite will be sent once client fills out suitability assessment',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
    },
  },
  {
    id: 'note-2',
    type: 'custom',
    position: { x: 1430, y: -130 },
    data: {
      title: 'Pre-Meeting Notes',
      subTitle: 'Create or view notes for client based on available data',
      icon: 'icon-park:notes',
    },
  },
  {
    id: 'meeting-2',
    type: 'custom',
    position: { x: 1630, y: 0 },
    data: {
      title: 'Meeting Day 2',
      subTitle: 'Pre-meeting notes and Suitability assessment help guide the conversation.',
      icon: 'mdi:virtual-meeting',
      iconColor: '#483285',
    },
  },
  {
    id: 'post-note-2',
    type: 'custom',
    position: { x: 1860, y: 170 },
    data: {
      title: 'Post-Meeting Notes',
      subTitle: 'Create post meeting notes based on takeaways from the discussion',
      icon: 'icon-park:notes',
    },
  },
  {
    id: 'onboarding',
    type: 'custom',
    position: { x: 2060, y: 10 },
    data: {
      title: 'Onboarding Questions',
      subTitle:
        'Onboarding questions will be sent once meeting is complete and client is onboarded',
      icon: 'mdi:frequently-asked-questions',
      iconColor: '#483285',
    },
  },
  {
    id: 'complete',
    type: 'custom',
    position: { x: 2400, y: 43 },
    data: {
      title: 'Client',
      subTitle: 'Client is onboarded',
      icon: 'mdi:frequently-asked-questions',
      iconColor: '#483285',
    },
  },
  {
    id: 'end',
    type: 'start',
    position: { x: 2750, y: 20 },
    data: {
      title: 'End',
    },
  },
];
const initialEdges = [
  {
    id: 'e21-2',
    source: 'start12',
    target: 'start',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e1-2',
    source: 'start',
    target: 'note',
    sourceHandle: 'top-source',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e2-3',
    source: 'note',
    target: 'meeting',
    targetHandle: 'top-target',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e3-4',
    source: 'meeting',
    target: 'post-note',
    sourceHandle: 'buttom-source',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e4-5',
    source: 'post-note',
    target: 'form',
    targetHandle: 'buttom-target',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'eform-5',
    source: 'form',
    target: 'second-calendly',
    type: 'straight',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'esecond-calendly-2',
    source: 'second-calendly',
    target: 'note-2',
    sourceHandle: 'top-source',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'enote-2-3',
    source: 'note-2',
    target: 'meeting-2',
    targetHandle: 'top-target',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'emeetin2-4',
    source: 'meeting-2',
    target: 'post-note-2',
    sourceHandle: 'buttom-source',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e4-onboarding',
    source: 'post-note-2',
    target: 'onboarding',
    targetHandle: 'buttom-target',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'e4-onboarding',
    source: 'post-note-2',
    target: 'onboarding',
    targetHandle: 'buttom-target',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'onboarding-5',
    source: 'onboarding',
    target: 'complete',
    type: 'straight',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
  {
    id: 'onboarding-512',
    source: 'onboarding',
    target: 'end',
    type: 'straight',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },

  //   { id: 'e4-5', source: '4', target: '5' },
];

const nodeTypes = {
  custom: CustomNode,
  start: Start,
};

export default function ImportClientAutomationFlowView() {
  const theme = useTheme();

  const navigate = useRouter();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Stack
        flexDirection="row"
        px={3}
        borderBottom={1}
        borderColor={theme.palette.divider}
        bgcolor={theme.palette.background.paper}
        justifyContent="space-between"
        alignItems="center"
        height={DASHBOARD_HEADER_MOBILE}
      >
        <LogoIcon width={38} height={30} />
        <IconButton onClick={() => navigate.push(PATH_DASHBOARD.automation.new)}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Stack>
      <Stack flexDirection={'row'} height={1}>
        <AutomationDrawer />
        <Stack
          sx={{
            background: theme.palette.grey[200],
            height: `calc(100vh - ${DASHBOARD_HEADER_MOBILE}px)`,
          }}
          flexGrow={1}
        >
          <ReactFlow nodeTypes={nodeTypes} fitView nodes={initialNodes} edges={initialEdges}>
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
