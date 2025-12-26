import {
  Card,
  Chip,
  Dialog,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  LinearProgress,
  MenuItem,
  Popover,
  Button,
} from '@mui/material';
import { ActivityLogConfig } from '../../../@types/activityLog';
import { capitalCase } from 'change-case';
import Iconify from 'components/Iconify';
import CustomTable from 'components/table/table';
import useUser from 'hooks/useUser';
import { useCallback, useEffect, useState } from 'react';
import {
  exportAdvisorActivityLogs,
  getAdvisorActivityLogById,
  getAdvisorActivityLogs,
} from 'redux/slices/activityLogs';
import { dispatch, useDispatch, useSelector } from 'redux/store';
import { fDateTime } from 'utils/formatTime';
import { useSnackbar } from 'notistack';
import { startCase } from 'lodash';
import Scrollbar from 'components/Scrollbar';
import { useBoolean } from 'hooks/useBoolean';
import CustomDateRangePicker, { shortDateLabel } from 'components/custom-date-range-picker';
import { isAfter } from 'date-fns';
import Label from 'components/Label';

export default function MyActivityLogsListView({
  activityLogs,
  isLoading,
  type,
  filters,
  setFilters,
}: {
  activityLogs: ActivityLogConfig[];
  isLoading: boolean;
  type: 'my' | 'firm';
  filters: { startDate: Date | null; endDate: Date | null };
  setFilters: (filters: { startDate: Date | null; endDate: Date | null }) => void;
}) {
  const { authUser } = useUser();

  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const advisors = useSelector((state) => state.advisors);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const openDateRange = useBoolean();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const filteredData = applyFilter({
    inputData: activityLogs,
    search: searchText,
  });

  useEffect(() => {
    dispatch(getAdvisorActivityLogs({ advisorId: authUser?.sub }));
  }, [authUser?.sub, dispatch]);

  const TABLE_HEAD = [
    { id: 'id', label: 'Time' },
    { id: 'type', label: 'Action' },
    ...(type === 'firm' ? [{ id: 'advisorId', label: 'Performed By' }] : []),
    { id: 'description', label: 'Details' },
    { id: 'cta', label: '' },
  ];

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      setFilters({ startDate: newValue, endDate: filters.endDate });
    },
    [filters.endDate, setFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      setFilters({ startDate: filters.startDate, endDate: newValue });
    },
    [filters.startDate, setFilters]
  );

  const dateError = !!(
    filters.startDate &&
    filters.endDate &&
    isAfter(filters.startDate, filters.endDate)
  );

  const renderFilterDate = (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1.2,
          marginLeft: 2,
        }}
      >
        <Button
          color="inherit"
          onClick={openDateRange.onTrue}
          sx={{
            width: 160,
          }}
          endIcon={
            <Iconify
              icon={
                openDateRange.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
              }
              sx={{ ml: -0.5 }}
            />
          }
        >
          {!!filters.startDate && !!filters.endDate
            ? shortDateLabel(filters.startDate, filters.endDate)
            : 'Date Range'}
        </Button>

        {!!filters.startDate && !!filters.endDate && (
          <Iconify
            onClick={() => setFilters({ endDate: null, startDate: null })}
            icon="mdi:close"
            sx={{
              cursor: 'pointer',
              ':hover': {
                opacity: 0.8,
              },
            }}
          />
        )}
      </Stack>

      <CustomDateRangePicker
        variant="calendar"
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChangeStartDate={handleFilterStartDate}
        onChangeEndDate={handleFilterEndDate}
        open={openDateRange.value}
        onClose={openDateRange.onFalse}
        selected={!!filters.startDate && !!filters.endDate}
        error={dateError}
      />
    </>
  );

  return (
    <>
      <Stack
        flexDirection="row"
        alignItems="center"
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search logs..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {renderFilterDate}

        <IconButton onClick={handleClick}>
          <Iconify icon="mdi:dots-vertical" />
        </IconButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Stack
            sx={{
              width: 150,
            }}
          >
            <MenuItem
              onClick={async () => {
                handleClose();
                const resp = await dispatch(
                  exportAdvisorActivityLogs({ advisorId: authUser?.sub })
                );
                enqueueSnackbar(resp.message, {
                  variant: 'success',
                });
              }}
            >
              <Iconify sx={{ mr: 1 }} icon="mdi:export" />
              Export
            </MenuItem>
          </Stack>
        </Popover>
      </Stack>
      {isLoading && <LinearProgress sx={{ width: 1 }} />}
      <CustomTable
        key={type}
        tableHead={TABLE_HEAD}
        tableData={filteredData}
        elementWrappers={{
          id: (row: any) => <Typography>{row.id && fDateTime(Number(row.id))}</Typography>,
          type: (row: any) => <Label color="info">{capitalCase(row.type)}</Label>,
          ...(type === 'firm'
            ? {
                advisorId: (row: any) => (
                  <Typography>{row.advisorId && advisors.byId[row.advisorId]?.name}</Typography>
                ),
              }
            : {}),
          cta: (row: any) => (
            <IconButton onClick={() => setSelectedRow(row)}>
              <Iconify icon="eva:eye-fill" />
            </IconButton>
          ),
        }}
      />
      {selectedRow && (
        <LogsModal
          data={selectedRow}
          advisorId={authUser?.sub}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </>
  );
}

function applyFilter({ inputData, search }: { inputData: Record<string, any>[]; search: string }) {
  if (search) {
    inputData = inputData.filter(
      (item) =>
        String(item?.description)
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1
    );
  }

  return inputData;
}

function LogsModal({
  data,
  advisorId,
  onClose,
}: {
  data: ActivityLogConfig;
  advisorId: string;
  onClose: () => void;
}) {
  const { activityLog, isLoading } = useSelector((state) => state.activityLogs);

  useEffect(() => {
    if (activityLog?.id !== data.id) {
      dispatch(getAdvisorActivityLogById({ advisorId: advisorId, logId: data.id }));
    }
  }, [activityLog?.id, advisorId, data.id]);

  // render details in json format
  const detailsData = renderDetails(activityLog?.details);

  const TableHead =
    detailsData.length > 0 && typeof detailsData[0] === 'object'
      ? Object.keys(detailsData[0]).map((key) => ({ id: key, label: startCase(key) }))
      : [];

  return (
    <>
      <Dialog open={!!data?.id} onClose={onClose} fullWidth maxWidth="md">
        <Scrollbar>
          <Card
            sx={{ py: 2, height: 'fit-content', minHeight: 300, maxHeight: 800, overflow: 'auto' }}
          >
            {isLoading ? (
              <Stack height="100%">
                <CircularProgress sx={{ mx: 'auto', my: 'auto' }} />
              </Stack>
            ) : (
              <Stack height="100%">
                <Typography sx={{ mb: 2, mx: 2 }} variant="h6">
                  {capitalCase(data.type)}
                </Typography>

                <CustomTable
                  tableHead={TableHead}
                  elementWrappers={{
                    id: (row: any) => <Typography>{startCase(row.id)}</Typography>,
                    value: (row: any) => (
                      <Stack
                        sx={{
                          maxHeight: 160,
                          overflow: 'auto',
                          whiteSpace: typeof row.value === 'object' ? 'pre' : 'none',
                        }}
                      >
                        {typeof row.value === 'object'
                          ? JSON.stringify(row.value, null, 2)
                          : row.value}
                      </Stack>
                    ),
                  }}
                  tableData={detailsData || []}
                />
              </Stack>
            )}
          </Card>
        </Scrollbar>
      </Dialog>
    </>
  );
}

function renderDetails(details: any) {
  if (Array.isArray(details)) {
    return details.map((detail, index) => {
      if (typeof detail === 'object') {
        return {
          id: index,
          ...detail,
        };
      }
      return {
        id: index,
        value: detail,
      };
    });
  } else if (typeof details === 'object') {
    return Object.entries(details).map(([key, value], index) => ({
      id: key,
      value,
    }));
  }
  return [];
}
