// @mui
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Toolbar } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 1, 0, 2),
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.up('sm')]: {
    height: 96,
    padding: theme.spacing(0, 1, 0, 3),
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const SearchStyle = styled(GridToolbarQuickFilter)(({ theme }) => ({
  width: '100%',
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
  [theme.breakpoints.up('sm')]: {
    width: 240,
  },
}));

export default function CustomDataGridToolbar() {
  return (
    <>
      <RootStyle>
        <SearchStyle
          variant="outlined"
          debounceMs={1000} // time before applying the new quick filter value
        />
        <GridToolbarContainer>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarExport
            csvOptions={{
              allColumns: true,
            }}
          />
        </GridToolbarContainer>
      </RootStyle>
    </>
  );
}
