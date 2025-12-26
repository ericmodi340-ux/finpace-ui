import { Button, Divider, ListItem, ListItemText, Chip } from '@mui/material';
import AutomationFlow from '../AutomationFlow';
import { MarkerType, useOnSelectionChange } from 'reactflow';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import AutomationSidebarItem from '../AutomationSidebarItem';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFAutocomplete } from 'components/hook-form';
import { useDispatch, useSelector } from 'redux/store';
import FormProvider from 'components/hook-form/FormProvider';
import { AutomationConfig, AutomationStatus, CardNodeType } from '../../../../@types/automation';
import useIntegrations from 'hooks/useIntegrations';
import { services } from 'constants/integrations';
import { statuses } from 'constants/users';
import { getServiceName } from 'utils/integrations';
import { IntegrationServiceId } from '../../../../@types/integration';
import { RHFUploadBox } from 'components/hook-form/RHFUploadBox';
import useClientTags from 'hooks/useClientTags';
import { getDisclosureName } from 'utils/disclosures';
import { getDisclosures } from 'redux/slices/disclosures';
import { types } from 'constants/disclosures';
import { DisclosureType } from '../../../../@types/disclosure';
import { getTemplates } from 'redux/slices/templates';
import { AnyAction } from 'redux';
import { createAutomation } from 'redux/slices/automations';
import { createStorageItem } from 'redux/slices/storage';
import { useSnackbar } from 'notistack';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';

const initialNodes = [
  {
    id: 'advisor',
    type: 'input-card',
    selected: true,
    position: { x: 0, y: 0 },
    data: {
      title: 'Advisor',
      subTitle: 'Choose an advisor to whom you’d like to import clients',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      status: 'pending',
    },
  },
  {
    id: 'source',
    type: 'input-card',
    position: { x: 400, y: 0 },
    data: {
      title: 'Source',
      subTitle: 'Choose an source from which you’d like to import clients',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      status: 'pending',
    },
  },
  {
    id: 'disclosures',
    type: 'input-card',
    position: { x: 800, y: 0 },
    data: {
      title: 'Disclosures',
      subTitle: 'Choose an disclosure you want to send to clients',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      status: 'pending',
    },
  },
  {
    id: 'forms',
    type: 'input-card',
    position: { x: 1200, y: 0 },
    data: {
      title: 'Forms',
      subTitle: 'Choose an form you want to send to clients',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      status: 'pending',
    },
  },
  {
    id: 'importingClients',
    type: 'card',
    position: { x: 1600, y: 0 },
    data: {
      title: 'Importing Clients',
      subTitle: 'Choose an form you want to send to clients',
      icon: 'simple-icons:calendly',
      iconColor: '#483285',
      status: 'pending',
    },
  },
];

const initialEdges = [
  {
    id: '1',
    source: 'advisor',
    target: 'source',
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
    id: '2',
    source: 'source',
    target: 'disclosures',
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
    id: '3',
    source: 'disclosures',
    target: 'forms',
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
    id: '4',
    source: 'forms',
    target: 'importingClients',
    type: 'straight',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  },
];

export default function ImportClientAutomation({
  readOnly,
  currentAutomation,
  onClose,
}: {
  readOnly?: boolean;
  currentAutomation?: AutomationConfig;
  onClose: () => void;
}) {
  const [selectedNode, setSelectedNodes] = useState<null | CardNodeType>(initialNodes[0]);
  const [nodes, setNodes] = useState<CardNodeType[]>(initialNodes);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useRouter();

  const advisors = useSelector((state) => state.advisors);
  const { firm: firmDisclosures } = useSelector((state) => state.disclosures);
  const templates = useSelector((state) => state.templates);

  const { integrations } = useIntegrations();
  const clientTags = useClientTags();
  const { firm } = useSelector((state) => state.firm);
  const integrationsOptions = integrations.flatMap((integration) => {
    const service = services.find((service) => service.id === integration.id);
    if (!service?.isAvailable || integration.status === statuses.INACTIVE || !integration.fields)
      return [];
    if (service.id === 'wealthbox' || service.id === 'redtail')
      return `${integration.id}+-+${integration.integrationOwner}`;
    return [];
  });

  useEffect(() => {
    getDisclosures(types.FIRM as DisclosureType.FIRM, firm.id);
    dispatch(getTemplates() as unknown as AnyAction);
  }, [dispatch, firm.id]);

  const FormSchema = Yup.object().shape({
    advisor: Yup.string().nullable(),
    integration: Yup.mixed().nullable(),
    file: Yup.mixed(),
    tags: Yup.array().of(Yup.string()),
    disclosures: Yup.array().of(Yup.string()),
    forms: Yup.array().of(Yup.string()),
  });

  const defaultValues = useMemo(
    () => ({
      advisor: currentAutomation?.advisorId || '',
      integration: currentAutomation?.subtype
        ? currentAutomation.subtype === 'csv'
          ? 'csv'
          : `${currentAutomation?.integration}+-+${currentAutomation?.integrationOwner}`
        : '',
      file: '',
      tags: currentAutomation?.tags || [],
      disclosures: currentAutomation?.disclosures || [],
      forms: currentAutomation?.forms || [],
    }),
    [
      currentAutomation?.advisorId,
      currentAutomation?.disclosures,
      currentAutomation?.forms,
      currentAutomation?.integration,
      currentAutomation?.integrationOwner,
      currentAutomation?.subtype,
      currentAutomation?.tags,
    ]
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const { getValues, watch, setValue, handleSubmit } = methods;

  const onStartAutomation = handleSubmit(async (data) => {
    try {
      let payload;

      if (data.integration === 'csv') {
        const s3path = await createStorageItem({
          // @ts-ignore
          file: data.file,
          // @ts-ignore
          path: `automations/${data.advisor}/${Date.now()}-${data.file?.name}`,
        });

        payload = {
          advisorId: data.advisor,
          subtype: 'csv',
          csvPath: s3path.key,
          disclosures: [],
          forms: [],
          type: 'import',
        };
      } else {
        payload = {
          advisorId: data.advisor,
          subtype: 'integration',
          integration: String(data.integration).split('+-+')[0],
          integrationOwner: String(data.integration).split('+-+')[1],
          disclosures: [],
          forms: [],
          type: 'import',
        };
      }

      // @ts-ignore
      await createAutomation(payload);

      enqueueSnackbar('Automation created successfully', { variant: 'success' });
      navigate.push(PATH_DASHBOARD.automation.root);
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  });

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes[0]);
    },
  });

  const changeSelectedNode = useCallback(
    (id: string) => {
      const newNodes = nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            selected: true,
          };
        }
        return {
          ...node,
          selected: false,
        };
      });
      setNodes(newNodes);
    },
    [nodes]
  );

  const updateNodeState = (id: string, status: string, nextSelection?: string) => {
    const newNodes = nodes.map((node) => {
      if (node.id === nextSelection) {
        if (node.id === id) {
          return {
            ...node,
            selected: true,
            data: {
              ...node.data,
              status: status,
            },
          };
        }
        return {
          ...node,
          selected: true,
        };
      } else {
        if (node.id === id) {
          return {
            ...node,
            selected: false,
            data: {
              ...node.data,
              status: status,
            },
          };
        } else {
          return {
            ...node,
            selected: false,
          };
        }
      }
    });
    setNodes(newNodes);
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        // @ts-ignore
        setValue('file', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onExpand = (id: string) => {
    if (selectedNode?.id === id) {
      changeSelectedNode('none');
    } else {
      changeSelectedNode(id);
    }
  };

  useEffect(() => {
    if (currentAutomation?.status) {
      const newNodes = nodes.map((node) => {
        if (node.id === 'importingClients') {
          return {
            ...node,
            data: {
              ...node.data,
              status:
                currentAutomation?.status === AutomationStatus.STARTED ||
                currentAutomation?.status === AutomationStatus.SUBMITTED
                  ? 'running'
                  : currentAutomation?.status,
            },
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            status: 'completed',
          },
        };
      });
      setNodes(newNodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAutomation]);

  return (
    <FormProvider methods={methods}>
      <AutomationFlow
        onClose={onClose}
        title="Import Client Automation"
        icon="fa6-solid:file-import"
        reactFlowProps={{
          fitView: true,
          nodes: nodes,
          edges: initialEdges,
          onNodeClick: (event, node) => {
            setSelectedNodes(node);
          },
          // nodeTypes={nodeTypes} fitView nodes={initialNodes} edges={initialEdges}
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
        <AutomationSidebarItem
          onExpand={() => onExpand('advisor')}
          title="Advisor"
          active={selectedNode?.id === 'advisor'}
        >
          <RHFAutocomplete
            options={advisors.allIds}
            name="advisor"
            label="Select Advisor"
            readOnly={readOnly}
            getOptionLabel={(option) => advisors.byId[option]?.name || ''}
          />
          {!readOnly && (
            <Button
              disabled={!watch('advisor')}
              onClick={() => {
                const advisorId = getValues('advisor');
                updateNodeState('advisor', advisorId ? 'completed' : 'pending', 'source');
              }}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Continue
            </Button>
          )}
        </AutomationSidebarItem>
        <AutomationSidebarItem
          onExpand={() => onExpand('source')}
          title="Source"
          active={selectedNode?.id === 'source'}
        >
          <RHFAutocomplete
            options={[...integrationsOptions, 'csv']}
            name="integration"
            readOnly={readOnly}
            label="Select Source"
            getOptionLabel={(option) => {
              if (option === 'csv') {
                return 'Upload CSV';
              }
              return (
                `${getServiceName(option.split('+-+')[0] as IntegrationServiceId)} (${
                  option.split('+-+')[1]
                })` || ''
              );
            }}
          />
          {watch('integration') === 'csv' && (
            <RHFUploadBox
              sx={{ width: '100%', height: 50, mt: 2 }}
              name="file"
              disabled={readOnly}
              onDrop={handleDrop}
              accept={{ 'text/csv': ['.csv'] }}
            />
          )}
          {watch('integration') && watch('integration') !== 'csv' && (
            <RHFAutocomplete
              name="tags"
              label="Tags"
              multiple
              disabled={readOnly}
              sx={{ mt: 2 }}
              options={clientTags}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={`${option}`} size="small" label={option} />
                ))
              }
            />
          )}
          {!readOnly && (
            <Button
              disabled={
                !watch('advisor') || watch('integration') === 'csv'
                  ? !watch('file')
                  : !watch('integration')
              }
              onClick={() => {
                const integration = getValues('integration');
                updateNodeState('source', integration ? 'completed' : 'pending', 'disclosures');
              }}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Continue
            </Button>
          )}
        </AutomationSidebarItem>
        <AutomationSidebarItem
          onExpand={() => onExpand('disclosures')}
          title="Disclosures"
          active={selectedNode?.id === 'disclosures'}
        >
          <RHFAutocomplete
            options={firmDisclosures.map((item) => item.key)}
            name="disclosures"
            readOnly={readOnly}
            multiple
            label="Select Disclosures"
            getOptionLabel={(option) => getDisclosureName(String(option)) || ''}
          />
          {!readOnly && (
            <Button
              disabled={
                !watch('advisor') || watch('integration') === 'csv'
                  ? !watch('file')
                  : !watch('integration')
              }
              onClick={() => {
                const disclosures = getValues('disclosures');
                updateNodeState(
                  'disclosures',
                  disclosures.length ? 'completed' : 'pending',
                  'forms'
                );
              }}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Continue
            </Button>
          )}
        </AutomationSidebarItem>

        <AutomationSidebarItem
          onExpand={() => onExpand('forms')}
          title="Forms"
          active={selectedNode?.id === 'forms'}
        >
          <RHFAutocomplete
            options={templates.allIds}
            name="forms"
            readOnly={readOnly}
            label="Select Forms"
            multiple
            getOptionLabel={(option) => templates.byId[option]?.title || ''}
          />
          {!readOnly && (
            <Button
              disabled={
                !watch('advisor') || watch('integration') === 'csv'
                  ? !watch('file')
                  : !watch('integration') || !watch('disclosures').length
              }
              onClick={() => {
                const forms = getValues('forms');
                updateNodeState(
                  'forms',
                  forms.length ? 'completed' : 'pending',
                  'importingClients'
                );
              }}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Continue
            </Button>
          )}
        </AutomationSidebarItem>
        {!readOnly && (
          <AutomationSidebarItem
            onExpand={() => onExpand('importingClients')}
            title="Import Clients"
            active={selectedNode?.id === 'importingClients'}
          >
            {!readOnly && (
              <Button onClick={onStartAutomation} variant="contained">
                Start Automation
              </Button>
            )}
          </AutomationSidebarItem>
        )}
      </AutomationFlow>
    </FormProvider>
  );
}
