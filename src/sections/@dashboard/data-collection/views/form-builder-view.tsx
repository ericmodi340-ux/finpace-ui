import { Button, IconButton, Stack, Typography } from '@mui/material';
import LogoIcon from 'components/LogoIcon';
import { MAIN_HEADER_MOBILE } from 'config';

import AccountPopover from 'layouts/dashboard/header/AccountPopover';
import SurveyjsBuilder from '../surveyjs-builder';
import Iconify from 'components/Iconify';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';

export default function FormBuilderView() {
  const navigate = useNavigate();

  return (
    <Stack
      sx={{
        height: '100vh',
        backgroundColor: (theme) => theme.palette.background.neutral,
      }}
    >
      <Stack
        sx={{
          height: MAIN_HEADER_MOBILE,
          px: 3,
          backgroundColor: (theme) => theme.palette.primary.darker,
          color: (theme) => theme.palette.primary.contrastText,
        }}
        alignItems="center"
        direction="row"
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => navigate(PATH_DASHBOARD.dataCollection.forms)}
            sx={{
              backgroundColor: (theme) => theme.palette.common.white,
              ':hover': {
                backgroundColor: (theme) => theme.palette.common.white,
              },
              color: (theme) => theme.palette.common.black,
            }}
            size="small"
          >
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Typography variant="h5">Test Form</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Button variant="contained">Map to PDF</Button>
          <Button variant="contained">Send Form</Button>
          <AccountPopover />
        </Stack>
      </Stack>
      <SurveyjsBuilder />
    </Stack>
  );
}
