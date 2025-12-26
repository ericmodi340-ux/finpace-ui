import { useCallback, useState } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'components/Iconify';
import {
  ClientManager,
  IClientsTableFilterValue,
  IClientsTableFilters,
} from '../../../@types/client';
import { Button, Chip, MenuItem, tablePaginationClasses, TablePagination } from '@mui/material';
import { useBoolean } from 'hooks/useBoolean';
import CustomDateRangePicker, { shortDateLabel } from 'components/custom-date-range-picker';
import CustomPopover, { usePopover } from 'components/custom-popover';
import { startCase } from 'lodash';
import useClientTags, { useClientTagsFromStore } from 'hooks/useClientTags';
import Scrollbar from 'components/Scrollbar';
import { TablePaginationCustom, TableProps } from 'components/table';

// ----------------------------------------------------------------------

type Props = {
  filters: IClientsTableFilters;
  onFilters: (name: string, value: IClientsTableFilterValue) => void;
  //
  dateError: boolean;
  dataFiltered: ClientManager[];
  table: TableProps;
};

const Types = [
  { value: 'all', label: 'All' },
  {
    value: 'client',
    label: 'Clients',
  },
  {
    value: 'prospect',
    label: 'Prospects',
  },
];

export default function ClientsTableToolbar({
  filters,
  onFilters,
  //
  dateError,
  dataFiltered,
  table,
}: Props) {
  const popover = usePopover();
  const popoverTag = usePopover();
  const openDateRange = useBoolean();

  const CLIENT_TAGS = useClientTagsFromStore();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = CLIENT_TAGS.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (newValue: string) => {
      onFilters('type', newValue);
      popover.onClose();
    },
    [onFilters, popover]
  );

  const handleFilterTag = useCallback(
    (newValue: string) => {
      // Get current tags array
      const currentTags = Array.isArray(filters.tag) ? filters.tag : [];

      // Toggle the selected tag
      const newTags = currentTags.includes(newValue)
        ? currentTags.filter((tag) => tag !== newValue)
        : [...currentTags, newValue];

      onFilters('tag', newTags);
    },
    [onFilters, filters.tag]
  );

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(filters.tag) ? filters.tag : [];
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    onFilters('tag', newTags);
  };

  const renderFilterDate = (
    <>
      <Button
        color="inherit"
        onClick={openDateRange.onTrue}
        sx={{
          fontWeight: 400,
        }}
        endIcon={
          <Iconify
            icon={openDateRange.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            sx={{ ml: -0.5 }}
          />
        }
      >
        {!!filters.startDate && !!filters.endDate
          ? shortDateLabel(filters.startDate, filters.endDate)
          : 'Select Date'}
      </Button>

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

  const renderFilterType = (
    <>
      <Button
        color="inherit"
        onClick={popover.onOpen}
        sx={{
          fontWeight: 400,
        }}
        endIcon={
          <Iconify
            icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            sx={{ ml: -0.5 }}
          />
        }
      >
        {filters.type === 'all' ? 'All types' : startCase(filters.type)}
      </Button>

      <CustomPopover open={popover.open} onClose={popover.onClose}>
        <Stack width={160}>
          {Types.map((type) => (
            <MenuItem
              selected={filters.type === type.value}
              key={type.value}
              onClick={() => handleFilterType(type.value)}
            >
              {type.label}
            </MenuItem>
          ))}
        </Stack>
      </CustomPopover>
    </>
  );

  const renderFilterTag = (
    <>
      <Button
        color="inherit"
        sx={{
          fontWeight: 400,
        }}
        onClick={popoverTag.onOpen}
        endIcon={
          <Iconify
            icon={popoverTag.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            sx={{ ml: -0.5 }}
          />
        }
      >
        Tags
      </Button>

      <CustomPopover open={popoverTag.open} onClose={popoverTag.onClose}>
        <Stack sx={{ p: 1 }}>
          <TextField
            size="small"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Stack width={260} height={260} sx={{ overflowY: 'auto' }}>
            <Scrollbar>
              {filteredTags.map((tag) => (
                <MenuItem
                  selected={Array.isArray(filters.tag) && filters.tag.includes(tag)}
                  key={tag}
                  sx={{
                    width: 260,
                    overflowX: 'hidden',
                  }}
                  onClick={() => handleFilterTag(tag)}
                >
                  {tag}
                </MenuItem>
              ))}
            </Scrollbar>
          </Stack>
        </Stack>
      </CustomPopover>
    </>
  );

  const renderPagination = (
    <TablePagination
      rowsPerPageOptions={[]}
      component="div"
      count={dataFiltered.length}
      page={table.page}
      rowsPerPage={table.rowsPerPage}
      onPageChange={table.onChangePage}
      onRowsPerPageChange={table.onChangeRowsPerPage}
      sx={{
        [`& .${tablePaginationClasses.toolbar}`]: {
          borderTopColor: 'transparent',
        },
        borderTopColor: 'transparent',
      }}
    />
  );

  return (
    <>
      <Stack
        spacing={1}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        sx={{ width: 1 }}
      >
        <TextField
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Search Customers..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: 1, md: 280 },
          }}
          size="small"
        />

        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          flexGrow={1}
          flexWrap="wrap"
        >
          {renderFilterDate}

          {renderFilterType}

          {renderFilterTag}

          {renderPagination}
        </Stack>
      </Stack>
    </>
  );
}
