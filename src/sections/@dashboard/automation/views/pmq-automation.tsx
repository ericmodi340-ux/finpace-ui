import {
  Button,
  Divider,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutomationFlow from '../AutomationFlow';
import { useEdgesState, useNodesState, useOnSelectionChange } from 'reactflow';

import { useCallback, useLayoutEffect, useState } from 'react';
import { elkOptions, getLayoutedElements } from 'utils/elk';
import { CardNodeType } from '.../../@types/automation';
import { cloneDeep } from 'lodash';

const initialNodes = [
  {
    id: '1',
    type: 'start',
    position: {
      x: 0,
      y: 0,
    },
    data: {
      title: 'Start',
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '2',
    type: 'card',
    position: {
      x: 12,
      y: 147,
    },
    data: {
      title: 'Calendly Invitee',
      subTitle: 'When a client is added on finpace a new calendly invite is sent',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '3',
    type: 'card',
    position: {
      x: 12,
      y: 282,
    },
    data: {
      title: 'Pre-Meeting Notes',
      subTitle: 'Create or view notes for each client based on available data',
      icon: 'icon-park:notes',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '4',
    type: 'card',
    position: {
      x: 12,
      y: 417,
    },
    data: {
      title: 'Meeting Day',
      subTitle: 'Pre-meeting notes help guide the conversation.',
      icon: 'mdi:virtual-meeting',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '5',
    type: 'card',
    position: {
      x: 12,
      y: 552,
    },
    data: {
      title: 'Post-Meeting Notes',
      subTitle: 'Create post meeting notes based on takeaways from the discussion',
      icon: 'icon-park:notes',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '6',
    type: 'card',
    position: {
      x: 12,
      y: 687,
    },
    data: {
      title: 'Suitability Assessment',
      subTitle: 'Client will fill out suitability assessment.',
      icon: 'bxs:report',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '7',
    type: 'card',
    position: {
      x: 12,
      y: 822,
    },
    data: {
      title: 'Calendly Invitee',
      subTitle: 'Calendly invite will be sent once client fills out suitability assessment',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '8',
    type: 'card',
    position: {
      x: 12,
      y: 957,
    },
    data: {
      title: 'Pre-Meeting Notes',
      subTitle: 'Create or view notes for client based on available data',
      icon: 'icon-park:notes',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '9',
    type: 'card',
    position: {
      x: 12,
      y: 1092,
    },
    data: {
      title: 'Meeting Day 2',
      subTitle: 'Pre-meeting notes and Suitability assessment help guide the conversation.',
      icon: 'mdi:virtual-meeting',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '10',
    type: 'card',
    position: {
      x: 12,
      y: 1227,
    },
    data: {
      title: 'Post-Meeting Notes',
      subTitle: 'Create post meeting notes based on takeaways from the discussion',
      icon: 'icon-park:notes',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '11',
    type: 'card',
    position: {
      x: 12,
      y: 1362,
    },
    data: {
      title: 'Onboarding Questions',
      subTitle:
        'Onboarding questions will be sent once meeting is complete and client is onboarded',
      icon: 'mdi:frequently-asked-questions',
      iconColor: '#483285',
      isExtendable: true,
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '12',
    type: 'card',
    position: {
      x: 12,
      y: 1497,
    },
    data: {
      title: 'Client',
      subTitle: 'Client is onboarded',
      icon: 'mdi:frequently-asked-questions',
      iconColor: '#483285',
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
  {
    id: '13',
    type: 'start',
    position: {
      x: 12,
      y: 1632,
    },
    data: {
      title: 'End',
    },
    targetPosition: 'top',
    sourcePosition: 'bottom',
  },
];

const initialEdges = [
  {
    id: '1',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '1_s0',
        startPoint: {
          x: 162,
          y: 132,
        },
        endPoint: {
          x: 162,
          y: 147,
        },
        incomingShape: '1',
        outgoingShape: '2',
      },
    ],
    container: 'root',
  },
  {
    id: '2',
    source: '2',
    target: '3',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '2_s0',
        startPoint: {
          x: 162,
          y: 267,
        },
        endPoint: {
          x: 162,
          y: 282,
        },
        incomingShape: '2',
        outgoingShape: '3',
      },
    ],
    container: 'root',
  },
  {
    id: '3',
    source: '3',
    target: '4',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '3_s0',
        startPoint: {
          x: 162,
          y: 402,
        },
        endPoint: {
          x: 162,
          y: 417,
        },
        incomingShape: '3',
        outgoingShape: '4',
      },
    ],
    container: 'root',
  },
  {
    id: '4',
    source: '4',
    target: '5',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '4_s0',
        startPoint: {
          x: 162,
          y: 537,
        },
        endPoint: {
          x: 162,
          y: 552,
        },
        incomingShape: '4',
        outgoingShape: '5',
      },
    ],
    container: 'root',
  },
  {
    id: '5',
    source: '5',
    target: '6',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '5_s0',
        startPoint: {
          x: 162,
          y: 672,
        },
        endPoint: {
          x: 162,
          y: 687,
        },
        incomingShape: '5',
        outgoingShape: '6',
      },
    ],
    container: 'root',
  },
  {
    id: '6',
    source: '6',
    target: '7',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '6_s0',
        startPoint: {
          x: 162,
          y: 807,
        },
        endPoint: {
          x: 162,
          y: 822,
        },
        incomingShape: '6',
        outgoingShape: '7',
      },
    ],
    container: 'root',
  },
  {
    id: '7',
    source: '7',
    target: '8',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '7_s0',
        startPoint: {
          x: 162,
          y: 942,
        },
        endPoint: {
          x: 162,
          y: 957,
        },
        incomingShape: '7',
        outgoingShape: '8',
      },
    ],
    container: 'root',
  },
  {
    id: '8',
    source: '8',
    target: '9',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '8_s0',
        startPoint: {
          x: 162,
          y: 1077,
        },
        endPoint: {
          x: 162,
          y: 1092,
        },
        incomingShape: '8',
        outgoingShape: '9',
      },
    ],
    container: 'root',
  },
  {
    id: '9',
    source: '9',
    target: '10',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '9_s0',
        startPoint: {
          x: 162,
          y: 1212,
        },
        endPoint: {
          x: 162,
          y: 1227,
        },
        incomingShape: '9',
        outgoingShape: '10',
      },
    ],
    container: 'root',
  },
  {
    id: '10',
    source: '10',
    target: '11',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '10_s0',
        startPoint: {
          x: 162,
          y: 1347,
        },
        endPoint: {
          x: 162,
          y: 1362,
        },
        incomingShape: '10',
        outgoingShape: '11',
      },
    ],
    container: 'root',
  },
  {
    id: '11',
    source: '11',
    target: '12',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '11_s0',
        startPoint: {
          x: 162,
          y: 1482,
        },
        endPoint: {
          x: 162,
          y: 1497,
        },
        incomingShape: '11',
        outgoingShape: '12',
      },
    ],
    container: 'root',
  },
  {
    id: '12',
    source: '12',
    target: '13',
    type: 'smoothstep',
    animated: true,
    sourceHandle: 'buttom-source',
    targetHandle: 'top-target',
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      strokeWidth: 2,
    },
    sections: [
      {
        id: '12_s0',
        startPoint: {
          x: 162,
          y: 1617,
        },
        endPoint: {
          x: 162,
          y: 1632,
        },
        incomingShape: '12',
        outgoingShape: '13',
      },
    ],
    container: 'root',
  },
];

export default function PMQAutomation({ onClose }: { onClose: () => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNodes] = useState<null | CardNodeType>(nodes[0]);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes[0]);
    },
  });

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? cloneDeep(initialNodes) : nodes;
      const es = useInitialNodes ? cloneDeep(initialEdges) : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
          // console.log(layoutedNodes);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          // window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [nodes, edges]
  );

  // // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  return (
    <AutomationFlow
      onClose={onClose}
      title="PMQ Automation"
      icon="fa6-solid:file-import"
      reactFlowProps={{
        fitView: true,
        nodes: nodes,
        edges: edges,
        onNodesChange: onNodesChange,
        onEdgesChange: onEdgesChange,
        nodesDraggable: false,
      }}
    >
      <ListItem
        sx={{
          p: 2.5,
        }}
      >
        <ListItemText
          primary="About this Automation"
          secondary="This automation allows you to import clients from a CSV file or a supporting integration."
        />
      </ListItem>
      <Divider />
      {selectedNode &&
        (selectedNode?.type === 'new-card' ? (
          <Stack p={2} spacing={1}>
            <Typography variant="subtitle1">{selectedNode?.data?.title}</Typography>
            <TextField value={title} onChange={(e) => setTitle(e.target.value)} label="Title" />
            <TextField
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              label="Sub Title"
            />
            <Button
              onClick={() => {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id === selectedNode?.id) {
                      return {
                        ...n,
                        data: {
                          ...n.data,
                          title,
                          subTitle,
                        },
                      };
                    }
                    return n;
                  })
                );
              }}
              variant="contained"
            >
              Save
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const selectedNodeId = selectedNode?.id;
                const newNodes = nodes.filter((e) => e.id !== selectedNodeId);
                const preEdge = edges.find((e) => e.target === selectedNodeId);
                const edge = edges.find((e) => e.source === selectedNodeId);
                const nextEdge = edges.find((e) => e.source === edge?.target);
                const filterEdges = edges.filter((e) => e.id !== edge?.id);
                const newEdges = filterEdges.map((e) =>
                  e.id === preEdge?.id ? { ...e, target: nextEdge?.source || '' } : e
                );
                getLayoutedElements(newNodes, newEdges, {
                  'elk.direction': 'DOWN',
                }).then(({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
                  setNodes(layoutedNodes);
                  setEdges(layoutedEdges);
                });
              }}
            >
              Delete
            </Button>
          </Stack>
        ) : (
          <Stack p={2} spacing={1}>
            <Typography variant="subtitle1">{selectedNode?.data?.title}</Typography>
            <Typography variant="body2">{selectedNode?.data?.subTitle}</Typography>
            {selectedNode?.data?.title.includes('Notes') && (
              <TextField placeholder="Add Meeting Notes" multiline={true} rows={4} />
            )}
          </Stack>
        ))}
      <Stack gap={2} flexDirection="row" position="absolute" bottom={10} left={10} right={10}>
        <Button fullWidth variant="contained">
          Start
        </Button>
      </Stack>
    </AutomationFlow>
  );
}
