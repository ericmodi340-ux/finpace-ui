import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
// components
import Label from 'components/Label';
// constants
import { automationStatus } from 'constants/automation';
// utils
import { fDateTime } from 'utils/formatTime';
import { AutomationConfig } from '../../../@types/automation';

// ----------------------------------------------------------------------

type Props = {
  automation: AutomationConfig;
};

export default function StatusCell({ automation }: Props) {
  const theme = useTheme();

  const { status } = automation;

  let tooltip = '';
  switch (status) {
    case automationStatus.STARTED:
      tooltip = 'This process has been started';
      if (automation.startedAt) {
        tooltip += ` on ${fDateTime(automation.startedAt)}`;
      }
      break;
    case automationStatus.COMPLETED:
      tooltip = 'This process has been completed';
      break;
    case automationStatus.CANCELLED:
      tooltip = 'This process has been cancelled';
      break;
    case automationStatus.FAILED:
      tooltip = 'This process has been failed';
      break;
    default:
      tooltip = '';
      break;
  }

  return (
    <Tooltip title={tooltip}>
      <div>
        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={
            (status === automationStatus.STARTED && 'secondary') ||
            (status === automationStatus.COMPLETED && 'success') ||
            (status === automationStatus.CANCELLED && 'error') ||
            (status === automationStatus.FAILED && 'error') ||
            'info'
          }
        >
          {sentenceCase(status || 'Unknown')}
        </Label>
      </div>
    </Tooltip>
  );
}
