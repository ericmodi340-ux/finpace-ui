// @mui
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, OutlinedInput, InputAdornment } from '@mui/material';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

// ----------------------------------------------------------------------

type Props = {
  searchPlaceholder?: string;
  filterName: string;
  onFilterName: (value: string) => void;
  onToggleToolbar: () => void;
};

export default function DataListToolbar({
  searchPlaceholder = 'Search items...',
  filterName,
  onFilterName,
  onToggleToolbar,
}: Props) {
  return (
    <RootStyle>
      <SearchStyle
        value={filterName}
        onChange={(e) => onFilterName(e.target.value)}
        placeholder={searchPlaceholder}
        startAdornment={
          <InputAdornment position="start">
            <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        }
      />

      <Tooltip title="Customize view">
        <IconButton onClick={onToggleToolbar}>
          <Iconify icon={'ic:round-filter-list'} />
        </IconButton>
      </Tooltip>
    </RootStyle>
  );
}
