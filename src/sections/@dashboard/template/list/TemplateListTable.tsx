import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Stack, Tooltip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { useSelector, dispatch } from 'redux/store';
import { deleteTemplate, getTemplates } from 'redux/slices/templates';
// components
import DataListTable from 'components/DataListTable';
// sections
import { StatusCell } from './cells';
import TemplateMoreMenu from './TemplateMoreMenu';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import { AnyAction } from 'redux';
import { TemplateManager } from '../../../../@types/template';
import DateComponent from 'components/DateComponent';
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  {
    field: 'title',
    headerName: 'Title',
    hideable: false,
    flex: 1,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
        }}
      >
        <Link
          to={`${PATH_DASHBOARD.templates.root}/${params.row.id}`}
          color="inherit"
          variant="subtitle2"
          component={RouterLink}
          noWrap
        >
          {params.row.title}
        </Link>
        {params.row?.signingEvent && (
          <Iconify
            sx={{
              ml: 1,
              height: 16,
              width: 16,
            }}
            icon="mdi:file-sign"
          />
        )}
      </Stack>
    ),
  },
  {
    field: 'inactive',
    headerName: 'Visibility',
    flex: 0.4,
    renderCell: (params: GridRenderCellParams) => <StatusCell inactive={params.value} />,
  },
  {
    field: 'updatedAt',
    headerName: 'Date Modified',
    minWidth: 200,
    hideable: true,
    renderCell: (params: GridRenderCellParams) => (
      <DateComponent date={params.row?.updatedAt || params.row?.createdAt} />
    ),
  },
];

// ----------------------------------------------------------------------

export default function TemplateListTable() {
  const { enqueueSnackbar } = useSnackbar();

  const templates = useSelector((state) => state.templates);
  const tableData = arrayFromObj(templates.byId, templates.allIds) as TemplateManager[];

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      enqueueSnackbar('Delete template success', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  useEffect(() => {
    dispatch(getTemplates() as unknown as AnyAction);
  }, []);

  return (
    <DataListTable
      data={tableData}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <TemplateMoreMenu
          onDelete={() => handleDeleteTemplate(params.row.id)}
          templateId={params.row.id}
        />
      )}
      loading={templates.isLoading}
      sortingOrder={['desc', 'asc']}
      initialSortModel={[
        {
          field: 'updatedAt',
          sort: 'desc',
        },
      ]}
    />
  );
}
