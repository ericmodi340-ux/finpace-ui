import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
// @types
import { UserStatus } from '../../../../../@types/user';
// components
import Label from 'components/Label';
// constants
import { statuses } from 'constants/users';

// ----------------------------------------------------------------------

type Props = {
  status: UserStatus;
};

export default function StatusCell({ status }: Props) {
  const theme = useTheme();

  return (
    <Label
      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
      color={!status ? 'info' : status !== statuses.ACTIVE ? 'error' : 'success'}
    >
      {sentenceCase(status || 'Unknown')}
    </Label>
  );
}
