import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
// components
import Label from 'components/Label';

// ----------------------------------------------------------------------

type Props = {
  inactive: boolean;
};

export default function StatusCell({ inactive }: Props) {
  return (
    <Label variant="filled" color={inactive ? 'secondary' : 'info'}>
      {sentenceCase(inactive ? 'Hidden' : 'Active')}
    </Label>
  );
}
