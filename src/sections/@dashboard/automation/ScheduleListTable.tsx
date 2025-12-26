// @mui
import { IconButton, MenuItem, Typography, Menu } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
// redux
import { dispatch, useSelector } from 'redux/store';
// components
import DataListTable from 'components/DataListTable';
// constants
import { AutomationConfig } from '../../../@types/automation';
import { useEffect, useRef, useState } from 'react';
import { deleteScheduledJob, getScheduledJobs } from 'redux/slices/automations';
import { AnyAction } from 'redux';
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

export default function ScheduleListTable() {
  const { scheduledJobs, isLoading } = useSelector((state) => state.automations);

  useEffect(() => {
    dispatch(getScheduledJobs() as unknown as AnyAction);
  }, []);

  const TABLE_COLUMNS = [
    {
      field: 'type',
      headerName: 'Job Type',
      hideable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => <JobTypeCell data={params.row} />,
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => `${params?.row?.frequency} hours`,
    },
    {
      field: 'submitterName',
      headerName: 'Started by',
      minWidth: 200,
    },
    {
      field: 'blueprintId',
      headerName: 'Automation ID',
    },
  ];

  return (
    <DataListTable
      data={scheduledJobs.map((item) => ({
        ...item,
      }))}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => <JobTypeMoreMenu data={params.row} />}
      hideColumns={['blueprintId']}
      searchPlaceholder={`Search Automation...`}
      loading={isLoading}
      getRowId={(row) => row?.blueprintId}
      initialSortModel={[
        {
          field: 'startedAt',
          sort: 'desc',
        },
      ]}
    />
  );
}

const JobTypeCell = ({ data }: { data: AutomationConfig }) => (
  <>
    <Typography textTransform={'capitalize'}>
      {data.type === 'import' ? `Importing Clients From ${data?.integration || 'CSV'}` : data.type}
    </Typography>
  </>
);

function JobTypeMoreMenu({ data }: { data: AutomationConfig }) {
  //   const { enqueueSnackbar } = useSnackbar();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  //   const [loading, setLoading] = useState(false);

  const handleDeleteJob = async () => {
    setLoading(true);
    await deleteScheduledJob(data?.blueprintId);
    setLoading(false);
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { px: 1, width: '250', color: 'text.secondary' },
        }}
      >
        <MenuItem
          disabled={loading}
          onClick={handleDeleteJob}
          sx={{ borderRadius: 1, typography: 'body2' }}
        >
          <Iconify icon={'eva:close-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
          Delete Job
        </MenuItem>
      </Menu>
    </>
  );
}
