import { useState } from 'react';
import { useNavigate } from 'react-router';
// @mui
import { styled } from '@mui/material/styles';
import {
  Autocomplete,
  TextField,
  Slide,
  Button,
  InputAdornment,
  ClickAwayListener,
  Typography,
  Stack,
} from '@mui/material';
// @types
import { AdvisorManager } from '../../../@types/advisor';
import { ClientManager } from '../../../@types/client';
// redux
import { useSelector } from 'redux/store';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Iconify from 'components/Iconify';
import { IconButtonAnimate } from 'components/animate';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import cssStyles from 'utils/cssStyles';
import useSettings from 'hooks/useSettings';
import SvgIconStyle from 'components/SvgIconStyle';

// ----------------------------------------------------------------------

enum SearchCategory {
  CLIENTS = 'clients',
  ADVISORS = 'advisors',
}

type SearchOption = {
  id: string;
  name: string;
  email: string;
  category: SearchCategory;
};

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const SearchbarStyle = styled('div')(({ theme }) => ({
  ...cssStyles(theme).bgBlur({ blur: 12 }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);

  const { themeMode } = useSettings();

  const advisors = useSelector((state) => state.advisors);
  const clients = useSelector((state) => state.clients);
  const clientsArray = arrayFromObj(clients.byId, clients.allIds) as ClientManager[];
  const advisorsArray = arrayFromObj(advisors.byId, advisors.allIds) as AdvisorManager[];
  const prospectArray = clientsArray.filter((client) => client.isProspect);
  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (category: SearchCategory, id: string) => {
    handleClose();
    navigate(`${PATH_DASHBOARD[category].root}/${id}`);
  };

  // @ts-ignore
  const searchOptions: SearchOption[] = [
    ...clientsArray
      .filter((client) => !client.isProspect)
      .map((client) => ({ ...client, category: 'clients' as SearchCategory })),
    ...prospectArray.map((client) => ({ ...client, category: 'prospects' as SearchCategory })),
    ...advisorsArray.map((advisor) => ({ ...advisor, category: 'advisors' as SearchCategory })),
  ];

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div id="header-search-onboarding">
        {!isOpen && (
          <IconButtonAnimate onClick={handleOpen}>
            <SvgIconStyle
              src={themeMode === 'dark' ? '/icons/search-dark-mode.svg' : '/icons/search.svg'}
            />
          </IconButtonAnimate>
        )}

        <Slide direction="down" in={isOpen} mountOnEnter unmountOnExit>
          <SearchbarStyle>
            <Autocomplete
              fullWidth
              options={searchOptions}
              groupBy={(option) => option.category.toUpperCase()}
              getOptionLabel={(option) => `${option.name || ''} ${option.email || ''}`}
              renderOption={(props, option) => (
                <li {...props} onClick={() => handleClick(option.category, option.id)}>
                  <Stack direction="column">
                    <Typography variant="subtitle1">{option.name || ''}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {option.email || ''}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search…"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon={'eva:search-fill'}
                          sx={{ color: 'text.disabled', width: 20, height: 20 }}
                        />
                      </InputAdornment>
                    ),
                    sx: {
                      fontWeight: 'fontWeightBold',
                      '& > fieldset': {
                        borderColor: 'transparent !important',
                      },
                    },
                  }}
                />
              )}
              sx={{ mr: 2 }}
            />

            <Button onClick={handleClose}>Cancel</Button>
          </SearchbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
