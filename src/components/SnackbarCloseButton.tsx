import { SnackbarKey, useSnackbar } from 'notistack';
// @mui
import { IconButton } from '@mui/material';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

type Props = {
  snackbarKey: SnackbarKey;
};

export default function SnackbarCloseButton({ snackbarKey }: Props) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)}>
      <Iconify icon={`ic:round-close`} />
    </IconButton>
  );
}
