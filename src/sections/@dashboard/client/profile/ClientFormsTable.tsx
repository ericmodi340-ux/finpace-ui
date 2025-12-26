import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Tooltip } from '@mui/material';
import { GridRenderCellParams, GridFilterItem, GridLinkOperator } from '@mui/x-data-grid';
// @types
import { FormManager, FormStatus, FormReviewer } from '../../../../@types/form';
import { EnvelopeSigner } from '../../../../@types/envelope';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { useSelector } from 'redux/store';
// components
import DataListTable from 'components/DataListTable';
import DateComponent from 'components/DateComponent';
// sections
import { CombinedStatusCell, CombinedRecipientsCell } from 'sections/@dashboard/form/list/cells';
import CombinedMoreMenu from 'sections/@dashboard/form/list/CombinedMoreMenu';
// hooks
import useUser from 'hooks/useUser';
// utils
import { getClientTypeName } from 'utils/clients';
// constants
import { roles } from 'constants/users';
import useQuickFilters from 'hooks/useQuickFilters';
import { UserRole } from '../../../../@types/user';

// ----------------------------------------------------------------------

type Props = {
  clientForms: FormManager[];
  isLoading: boolean;
  onRefresh?: () => void;
  status?: FormStatus[];
  pendingReviewers?: FormReviewer['type'][];
  pendingSigners?: EnvelopeSigner[];
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
  linkOperator?: GridLinkOperator;
};

export default function ClientFormsTable({
  clientForms,
  isLoading,
  onRefresh,
  status,
  pendingReviewers,
  pendingSigners,
  filterBy = [],
  hideColumns = [],
  linkOperator,
}: Props) {
  const { authUser } = useUser();
  const clients = useSelector((state) => state.clients);
  const advisors = useSelector((state) => state.advisors);
  const { applyFilterByName, applyFilterByAdvisor, applyFilterByTemplate } = useQuickFilters();

  const preppedForms = useMemo(
    () =>
      clientForms.map(
        (form) =>
          ({
            ...form,
            clientTypeName: getClientTypeName(clients.byId[form.clientId]),
            clientName: clients.byId[form.clientId]?.name,
            advisorName: advisors.byId[form.advisorId]?.name,
          }) as FormManager
      ),
    [clientForms, clients.byId, advisors.byId]
  );

  const TABLE_COLUMNS = [
    {
      field: 'clientName',
      headerName: 'Client',
      hideable: true,
      flex: 1.5,
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
      field: 'formTitle',
      headerName: 'Form Title',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const readonly =
          params.row.status === FormStatus.COMPLETED ||
          params.row.status === FormStatus.CANCELLED ||
          (authUser?.role === UserRole.CLIENT &&
            params.row?.currentReviewerRole !== UserRole.CLIENT);

        return (
          <Tooltip title={params.value} placement="top">
            <Link
              to={`${PATH_DASHBOARD.forms.root}/${params.row.id}${readonly ? '/view' : ''}`}
              color="inherit"
              variant="subtitle2"
              component={RouterLink}
              noWrap
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: 300,
              }}
            >
              {params.value}
            </Link>
          </Tooltip>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date Started',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <DateComponent date={params.value} />,
    },
    {
      field: 'dateSent',
      headerName: 'Date Sent',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        // Show envelope sentAt if envelope exists, otherwise show form dateSent
        const sentDate = params.row.envelope?.sentAt || params.value;
        return <DateComponent date={sentDate} />;
      },
    },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [
          {
            field: 'advisorName',
            headerName: 'Advisor',
            flex: 1,
            minWidth: 150,
            getApplyQuickFilterFn: applyFilterByAdvisor,
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
      flex: 1.2,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <CombinedStatusCell form={params.row} authUser={authUser} />
      ),
    },
    {
      field: 'recipients',
      headerName: 'Recipients',
      filterable: false,
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => <CombinedRecipientsCell form={params.row} />,
    },
  ].map((column) => {
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
  });

  return (
    <DataListTable
      data={preppedForms || []}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <CombinedMoreMenu form={params.row} isLoading={isLoading} onFormCancel={onRefresh} />
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
        ...(pendingReviewers && pendingReviewers.length
          ? [
              {
                id: 'nextReviewer',
                columnField: 'nextReviewer',
                operatorValue: 'isAnyOf',
                value: pendingReviewers,
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
      hideColumns={[...hideColumns]}
      searchPlaceholder={`Search forms and documents...`}
      loading={isLoading}
      linkOperator={linkOperator}
      initialSortModel={[
        {
          field: 'createdAt',
          sort: 'desc',
        },
      ]}
      sx={{
        '& .MuiDataGrid-columnHeaders': {
          minHeight: '56px !important',
          maxHeight: '56px !important',
          borderRadius: '0px',
        },
        '& .MuiDataGrid-columnHeader': {
          borderRadius: '0px',
          display: 'flex',
          alignItems: 'center',
          height: '56px !important',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600,
        },
        '& .MuiDataGrid-row': {
          minHeight: '56px !important',
          maxHeight: '56px !important',
        },
        '& .MuiDataGrid-cell': {
          borderRadius: '0px',
          display: 'flex',
          alignItems: 'center',
          height: '56px !important',
          padding: '0 16px',
        },
        '& .MuiDataGrid-cell[data-field="recipients"]': {
          justifyContent: 'flex-start',
          paddingLeft: '16px',
        },
        '& .MuiDataGrid-cell[data-field="status"]': {
          justifyContent: 'flex-start',
          paddingLeft: '16px',
        },
      }}
    />
  );
}
