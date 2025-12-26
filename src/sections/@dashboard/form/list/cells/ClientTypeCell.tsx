import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
// @types
import { FormManager } from '../../../../../@types/form';
// components
import Label from 'components/Label';
// constants
import { clientTypes } from 'constants/forms';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
};

export default function ClientTypeCell({ form }: Props) {
  const theme = useTheme();
  const { clientTypeName } = form;

  return (
    <Label
      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
      color={
        (clientTypeName === clientTypes.CLIENT && 'success') ||
        (clientTypeName === clientTypes.PROSPECT && 'warning') ||
        'info'
      }
    >
      {sentenceCase(clientTypeName || 'Client')}
    </Label>
  );
}
