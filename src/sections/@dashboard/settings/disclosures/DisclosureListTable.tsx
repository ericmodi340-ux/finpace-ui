// @mui
import { Typography } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
// components
import DataListTable from 'components/DataListTable';
// sections
import DisclosureMoreMenu from './DisclosureMoreMenu';
// utils
import { fDate } from 'utils/formatTime';
import { getDisclosureName } from 'utils/disclosures';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  {
    field: 'name',
    headerName: 'Name',
    hideable: false,
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant="subtitle2" noWrap>
        {getDisclosureName(params.row.key)}
      </Typography>
    ),
  },
  {
    field: 'lastModified',
    headerName: 'Last Modified',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <>{fDate(params.row.lastModified, 'MMM d, yyyy')}</>
    ),
  },
  {
    field: 'size',
    headerName: 'Size',
    renderCell: (params: GridRenderCellParams) => <>{formatBytes(params.row.size)}</>,
  },
];

// ----------------------------------------------------------------------

type Props = {
  disclosures?: any[];
  onDeleteDisclosure: (key: string) => Promise<void>;
  loading?: boolean;
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function DisclosureListTable({
  disclosures = [],
  onDeleteDisclosure,
  loading = false,
}: Props) {
  return (
    <DataListTable
      data={disclosures.map((disclosure) => ({
        ...disclosure,
        id: disclosure.key,
        name: getDisclosureName(disclosure.key),
      }))}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <DisclosureMoreMenu onDelete={() => onDeleteDisclosure(params.row.key)} />
      )}
      searchPlaceholder={`Search disclosures...`}
      loading={loading}
    />
  );
}
