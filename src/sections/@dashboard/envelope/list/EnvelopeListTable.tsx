import { Link as RouterLink, useParams } from 'react-router-dom';
// @mui
import { Link } from '@mui/material';
import { GridRenderCellParams, GridValueGetterParams, GridFilterItem } from '@mui/x-data-grid';
// @types
import { EnvelopeSigner, EnvelopeStatus } from '../../../../@types/envelope';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { useSelector } from 'redux/store';
// components
import DataListTable from 'components/DataListTable';
import DateComponent from 'components/DateComponent';
// sections
import { StatusCell, DeliveryMethodCell, RecipientsCell } from './cells';
import EnvelopeMoreMenu from './EnvelopeMoreMenu';
// constants
import { envelopeRecipients, envelopeRecipientStatuses } from 'constants/envelopes';
import { getClientTypeName } from 'utils/clients';
import useQuickFilters from 'hooks/useQuickFilters';
import { roles } from 'constants/users';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

function getNextSigner(params: GridValueGetterParams) {
  const envelope = params.row;

  let nextSigner;

  const pendingSigners = Object.keys(envelope.recipients).filter(
    (recipientId) => envelope.recipients[recipientId].status === envelopeRecipientStatuses.SENT
  );

  // Determine first based on order - this can potentially be removed
  if (pendingSigners.includes(envelopeRecipients.FIRST_INVESTOR)) {
    nextSigner = envelopeRecipients.FIRST_INVESTOR;
  } else if (pendingSigners.includes(envelopeRecipients.SECOND_INVESTOR)) {
    nextSigner = envelopeRecipients.SECOND_INVESTOR;
  } else if (pendingSigners.includes(envelopeRecipients.ADVISOR)) {
    nextSigner = envelopeRecipients.ADVISOR;
  } else if (pendingSigners.includes(envelopeRecipients.FIRM)) {
    nextSigner = envelopeRecipients.FIRM;
  }

  return nextSigner;
}

// ----------------------------------------------------------------------

type Props = {
  status?: EnvelopeStatus[];
  pendingSigners?: EnvelopeSigner[];
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
};

export default function EnvelopeListTable({
  status,
  pendingSigners,
  filterBy = [],
  hideColumns = [],
}: Props) {
  const clients = useSelector((state) => state.clients);
  const advisors = useSelector((state) => state.advisors);
  const { authUser } = useUser();
  const { clientId = '' } = useParams();
  const { envelopes, isLoading } = useSelector((state) => state.envelopes);
  const { applyFilterByName, applyFilterByAdvisor, applyFilterByTemplate } = useQuickFilters();
  const preppedEnvelopes = envelopes.map((envelope) => ({
    ...envelope,
    clientTypeName: getClientTypeName(clients.byId[envelope.clientId]),
  }));

  const filteredEnvelopes = clientId
    ? preppedEnvelopes.filter((envelope) => envelope.clientId === clientId)
    : preppedEnvelopes;

  const TABLE_COLUMNS = [
    {
      field: 'clientName',
      headerName: 'Client',
      hideable: false,
      flex: 1,
      minWidth: 200,
      filterable: !hideColumns.includes('clientName'),
      renderCell: (params: GridRenderCellParams) => (
        <Link
          to={`${PATH_DASHBOARD.clients.root}/${params.row.clientId}`}
          color="inherit"
          component={RouterLink}
          noWrap
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'templateId',
      headerName: 'Document Type',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => params?.row?.formTitle || '----',
    },
    {
      field: 'id',
      headerName: 'Envelope ID',
    },
    {
      field: 'sentAt',
      headerName: 'Date Sent',
      flex: 0.6,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <DateComponent date={params.value} />,
    },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [
          {
            field: 'advisorName',
            headerName: 'Advisor',
            flex: 0.6,
            minWidth: 150,
            filterable: !hideColumns.includes('advisorName'),
            renderCell: (params: GridRenderCellParams) => (
              <Link
                to={`${PATH_DASHBOARD.advisors.root}/${params.row.advisorId}`}
                color="inherit"
                component={RouterLink}
                noWrap
              >
                {params.value}
              </Link>
            ),
          },
        ]
      : []),
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.4,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => <StatusCell envelope={params.row} />,
    },
    {
      field: 'nextSigner',
      headerName: 'Recipients',
      filterable: false,
      valueGetter: getNextSigner,
      renderCell: (params: GridRenderCellParams) => <RecipientsCell envelope={params.row} />,
    },
    {
      field: 'deliveryMethod',
      headerName: 'Delivery',
      renderCell: (params: GridRenderCellParams) => (
        <DeliveryMethodCell deliveryMethod={params.value} />
      ),
    },
  ];

  return (
    <DataListTable
      data={filteredEnvelopes.map((item) => ({
        ...item,
        clientName: clients.byId[item.clientId]?.name,
        advisorName: advisors.byId[item.advisorId]?.name,
      }))}
      columns={TABLE_COLUMNS.map((column) => {
        if (column.field === 'clientId') {
          return {
            ...column,
            getApplyQuickFilterFn: applyFilterByName,
          };
        }
        if (column.field === 'advisorId') {
          return {
            ...column,
            getApplyQuickFilterFn: applyFilterByAdvisor,
          };
        }
        if (column.field === 'templateId') {
          return {
            ...column,
            getApplyQuickFilterFn: applyFilterByTemplate,
          };
        }
        return column;
      })}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <EnvelopeMoreMenu envelope={params.row} isLoading={isLoading} />
      )}
      filterBy={[
        ...filterBy,
        ...(status && status.length
          ? [
              {
                id: 'status',
                columnField: 'status',
                operatorValue: 'isAnyOf',
                value: status,
              },
            ]
          : []),
        ...(pendingSigners && pendingSigners.length
          ? [
              {
                id: 'nextSigner',
                columnField: 'nextSigner',
                operatorValue: 'isAnyOf',
                value: pendingSigners,
              },
            ]
          : []),
      ]}
      hideColumns={['id', ...hideColumns]}
      searchPlaceholder={`Search documents...`}
      loading={isLoading}
      initialSortModel={[
        {
          field: 'sentAt',
          sort: 'desc',
        },
      ]}
    />
  );
}
