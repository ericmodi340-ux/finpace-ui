// @mui
import { GridRenderCellParams } from '@mui/x-data-grid';
// redux
import { RootState, useSelector } from 'redux/store';
// @types
import { ClientManager, ClientsState } from '../../../@types/client';
import { UserRole } from '../../../@types/user';
// components
import DataListTable from 'components/DataListTable';
import DateComponent from 'components/DateComponent';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardHeader, Link, useTheme, Stack, Typography, Box, Tooltip } from '@mui/material';
import TemplateName from 'components/TemplateName';
import { FormsState } from '../../../@types/form';
import Label from 'components/Label';
// sections
import { NameCell } from '../user/list/cells';
// constants
import { PATH_DASHBOARD } from 'routes/paths';
import { getTemplateName } from 'utils/templates';
import { toArray } from 'lodash';
import { formStatuses } from 'constants/forms';
import Iconify from 'components/Iconify';

function getClientName(client?: ClientManager) {
  if (!client) return '';
  return client?.name;
}

const getClientStatus = ({
  status,
  isEnvelope,
  isFormReviewed,
}: {
  status: string;
  isEnvelope: boolean;
  isFormReviewed: boolean;
}) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'cancelled':
      return 'Cancelled';
    case 'sent':
      if (!isEnvelope) {
        if (isFormReviewed) {
          return 'Awaiting Advisor Review';
        } else {
          return 'Sent to Client';
        }
      } else {
        return 'Awaiting Client Signature';
      }
    case 'completed':
      return 'Completed';

    default:
      return 'Draft';
  }
};

// ----------------------------------------------------------------------

export default function PracticeFlowTable() {
  const { byId: clientsById } = useSelector((state: RootState) => state.clients) as ClientsState;
  const { byId: formsById } = useSelector((state: RootState) => state.forms) as FormsState;
  const { envelopes } = useSelector((state: RootState) => state.envelopes);
  const { byId: templatesById } = useSelector((state: RootState) => state.templates);

  const envelopesByClient = envelopes.map((envelope: any) => ({
    ...envelope,
    envelopeId: envelope.id,
    client: clientsById[envelope.clientId],
  }));

  const formsByClient = toArray(formsById).map((form) => ({
    ...form,
    formId: form.id,
    client: clientsById[form.clientId],
  }));

  const formWithoutEnvelopes = formsByClient.filter(
    (form: any) => !envelopesByClient.find((envelope) => envelope.formId === form.id)
  );

  const allFormsClients = envelopesByClient
    .concat(formWithoutEnvelopes)
    // Add template to the array to check if that templateId exists in our templates list
    .map((item) => ({ ...item, template: templatesById[item.templateId] }))
    // Removing none existing templates and cancelled forms
    .filter((item) => item.status !== 'cancelled' && !!item.template && !!item.client);

  const getStatus = (params: GridRenderCellParams) => {
    const isFormReviewed =
      params.row?.reviewers?.find((item: any) => !!item?.lastSubmittedAt)?.status === 'reviewed';
    const isEnvelope = !!params.row?.templateType;
    const status = getClientStatus({
      status: params.row?.status,
      isEnvelope,
      isFormReviewed,
    });
    return status;
  };
  const getDocType = (params: GridRenderCellParams) => {
    const isEnvelope = !!params.row?.templateType;
    const docType = isEnvelope ? 'DocuSign PDF' : 'Form';
    return docType;
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      flex: 1,
      valueGetter: (params: any) => getClientName(params.row.client),
      renderCell: (params: GridRenderCellParams) => {
        const isFormReviewed =
          params.row?.reviewers?.find((item: any) => !!item?.lastSubmittedAt)?.status ===
          'reviewed';

        const isEnvelope = !!params.row?.templateType;
        const status = getClientStatus({
          status: params.row.status,
          isEnvelope,
          isFormReviewed,
        });

        return (
          <NameCell user={params.row.client} type={'client' as UserRole.CLIENT} status={status} />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      minWidth: 150,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => <DateComponent date={params.row.createdAt} />,
    },
    {
      field: 'templateId',
      headerName: 'Template',
      minWidth: 200,
      flex: 1,
      valueGetter: (params: any) => {
        const template = templatesById[params.row.templateId];
        return getTemplateName(template);
      },
      renderCell: (params: GridRenderCellParams) => {
        const isEnvelope = !!params.row?.templateType;
        const isCompleted = params.row?.status === formStatuses.COMPLETED;

        if (!isEnvelope) {
          return (
            <Link
              to={`${PATH_DASHBOARD.forms.root}/${params.row.id}${isCompleted ? '/view' : ''}`}
              color="inherit"
              variant="subtitle2"
              component={RouterLink}
              noWrap
            >
              <TemplateName templateId={params.row.templateId} />
            </Link>
          );
        }
        return <TemplateName templateId={params.row.templateId} />;
      },
    },
    {
      field: 'status',
      minWidth: 200,
      flex: 1,
      headerName: 'Status',
      valueGetter: (params: GridRenderCellParams) => getStatus(params),
      renderCell: (params: GridRenderCellParams) => <StatusCell status={getStatus(params)} />,
    },
    {
      field: 'docType',
      headerName: 'Doc Type',
      minWidth: 200,
      flex: 1,
      valueGetter: (params: GridRenderCellParams) => getDocType(params),
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={getDocType(params)}>
          <Typography whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
            {getDocType(params)}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      sx={{
        '& .MuiCardHeader-action': {
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden',
        },

        '& 	.MuiCardHeader-title': {
          whiteSpace: 'nowrap',
        },
      }}
    >
      <CardHeader
        title="Status"
        sx={{ paddingBottom: 1 }}
        action={
          <Stack spacing={1} direction="row" justifyContent="center" alignItems="center">
            <Box
              sx={{
                display: 'inline-flex',
                borderRadius: '50%',
                alignItems: 'center',
                color: 'common.white',
                justifyContent: 'center',
                bgcolor: 'success.main',
              }}
            >
              <Iconify icon={'eva:diagonal-arrow-right-up-fill'} width={16} height={16} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 'auto' }} noWrap>
              All Set
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                borderRadius: '50%',
                alignItems: 'center',
                color: 'common.white',
                justifyContent: 'center',
                bgcolor: 'orange.main',
              }}
            >
              <Iconify icon={'eva:diagonal-arrow-left-down-fill'} width={16} height={16} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
              noWrap
            >
              Client Action Required
            </Typography>
          </Stack>
        }
      />
      <Stack>
        <DataListTable
          data={allFormsClients}
          columns={columns}
          disableColumnFilter={true}
          initialSortModel={[
            {
              field: 'createdAt',
              sort: 'desc',
            },
          ]}
          pageSize={5}
          sortingOrder={['desc', 'asc']}
        />
      </Stack>
    </Card>
  );
}

type StatusCellProps = {
  status: any;
};

function StatusCell({ status }: StatusCellProps) {
  const theme = useTheme();

  return (
    <Label
      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
      color={
        status === 'Cancelled' || status.includes('Sent')
          ? 'orange'
          : status === 'Draft'
          ? 'info'
          : status.includes('Awaiting Client Signature')
          ? 'orange'
          : 'success'
      }
    >
      {status || 'Unknown'}
    </Label>
  );
}
