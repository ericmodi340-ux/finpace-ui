// @mui
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
// @types
import { FormManager, FormStatus } from '../../../../../@types/form';
// components
import Label from 'components/Label';
// constants
import { formStatuses } from 'constants/forms';
// utils
import { fDateTime } from 'utils/formatTime';
import { startCase } from 'lodash';
import { AuthUserType } from '../../../../../@types/auth';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
  authUser: AuthUserType;
};

const getSigningStatus = (form: FormManager, user: any) => {
  if (
    form.status === formStatuses.COMPLETED ||
    form.status === formStatuses.CANCELLED ||
    form.status === formStatuses.DRAFT
  ) {
    return startCase(form.status);
  }
  if (form.currentReviewerRole) {
    if (form.currentReviewerRole === 'client' && user?.sub === form.clientId) {
      return `Awaiting Your Review` as FormStatus;
    }

    if (form.currentReviewerRole === 'advisor' && user?.sub === form.advisorId) {
      return `Awaiting Your Review` as FormStatus;
    }

    return `Awaiting ${startCase(form.currentReviewerRole)}` as FormStatus;
  }
  return '' as FormStatus;
};

export default function StatusCell({ form, authUser }: Props) {
  const theme = useTheme();
  const { status } = form;

  let tooltip = '';
  switch (getSigningStatus(form, authUser)) {
    case 'Draft':
      tooltip = 'This form is still a draft';
      break;

    case 'Complete':
      tooltip = 'This form was completed';
      if (form.dateCompleted) {
        tooltip += ` on ${fDateTime(form.dateCompleted)}`;
      }
      break;
    case 'Cancelled':
      tooltip = 'This form was cancelled';
      if (form.dateCancelled) {
        tooltip += ` on ${fDateTime(form.dateCancelled)}`;
      }
      if (form.cancelReason) {
        tooltip += ` for the following reason: ${form.cancelReason}`;
      }
      break;
    case 'Awaiting Client' as FormStatus:
      tooltip = 'This form was sent! Please wait for the client to review it.';
      if (form.dateSent) {
        tooltip += ` on ${fDateTime(form.dateSent)}`;
      }
      break;
    case 'Awaiting Advisor' as FormStatus:
      tooltip = 'This form was sent! Please wait for the advisor to review it.';
      if (form.dateSent) {
        tooltip += ` on ${fDateTime(form.dateSent)}`;
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
            (status === 'completed' && 'success') ||
            (status === 'sent' && 'warning') ||
            (status === 'cancelled' && 'error') ||
            (status === 'draft' && 'info') ||
            'default'
          }
        >
          {getSigningStatus(form, authUser)}
        </Label>
      </div>
    </Tooltip>
  );
}
