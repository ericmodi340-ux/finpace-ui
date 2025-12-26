import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
// @types
import { EnvelopeManager } from '../../../../../@types/envelope';
// components
import Label from 'components/Label';
// constants
import { envelopeStatuses } from 'constants/envelopes';
// utils
import { fDateTime } from 'utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  envelope: EnvelopeManager;
};

export default function StatusCell({ envelope }: Props) {
  const theme = useTheme();

  const { status } = envelope;

  let tooltip = '';
  switch (status) {
    case envelopeStatuses.SENT:
      tooltip = 'This document was sent to the first signer';
      if (envelope.sentAt) {
        tooltip += ` on ${fDateTime(envelope.sentAt)}`;
      }
      break;
    case envelopeStatuses.COMPLETED:
      tooltip = 'This document was signed by all parties';
      if (envelope.dateCompleted) {
        tooltip += ` on ${fDateTime(envelope.dateCompleted)}`;
      }
      break;
    case envelopeStatuses.CANCELLED:
      tooltip = 'This document was cancelled';
      if (envelope.dateCancelled) {
        tooltip += ` on ${fDateTime(envelope.dateCancelled)}`;
      }
      if (envelope.voidReason) {
        tooltip += ` for the following reason: ${envelope.voidReason}`;
      }
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
            (status === envelopeStatuses.SENT && 'secondary') ||
            (status === envelopeStatuses.COMPLETED && 'success') ||
            (status === envelopeStatuses.CANCELLED && 'error') ||
            'info'
          }
        >
          {sentenceCase(status || 'Unknown')}
        </Label>
      </div>
    </Tooltip>
  );
}
