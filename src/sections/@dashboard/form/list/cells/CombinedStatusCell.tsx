import { sentenceCase } from 'change-case';
import { startCase } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
// @types
import { FormManager, FormStatus } from '../../../../../@types/form';
import { AuthUserType } from '../../../../../@types/auth';
// components
import Label from 'components/Label';
// constants
import { formStatuses } from 'constants/forms';
import { envelopeStatuses } from 'constants/envelopes';
// utils
import { fDateTime } from 'utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
  authUser: AuthUserType;
};

const getCombinedStatus = (form: FormManager, user: any) => {
  // If form has envelope, show envelope status based on routing order
  if (form.envelope) {
    const { envelope } = form;

    // If envelope is completed or cancelled, show that status
    if (
      envelope.status === envelopeStatuses.COMPLETED ||
      envelope.status === envelopeStatuses.CANCELLED
    ) {
      return sentenceCase(envelope.status);
    }

    // Sort recipients by routing order to find current signer
    const sortedRecipients = Object.entries(envelope.recipients)
      .filter(([_, recipient]) => recipient && recipient.role === 'signer')
      .sort((a, b) => Number(a[1]!.routingOrder) - Number(b[1]!.routingOrder));

    // Find the first recipient with "sent" status (current signer)
    const currentSigner = sortedRecipients.find(([_, recipient]) => recipient?.status === 'sent');

    if (currentSigner) {
      const [, recipient] = currentSigner;

      // Check if current user is the one who needs to sign
      if (user?.email && recipient?.email === user.email) {
        return 'Awaiting Your Signature' as FormStatus;
      }

      // Map role names to display names
      const roleDisplayNames: { [key: string]: string } = {
        client_1: 'Client',
        client_2: 'Joint Investor',
        advisor: 'Advisor',
        firm: 'Firm',
      };

      const roleName = recipient?.roleName
        ? roleDisplayNames[recipient.roleName] || startCase(recipient.roleName)
        : 'Signer';
      return `Awaiting ${roleName} Signature` as FormStatus;
    }

    // Fallback to envelope status if no current signer found
    return sentenceCase(envelope.status || 'Unknown');
  }

  // Otherwise, show form status
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

export default function CombinedStatusCell({ form, authUser }: Props) {
  const theme = useTheme();
  const { status, envelope } = form;

  let tooltip = '';
  const displayStatus = getCombinedStatus(form, authUser);

  if (envelope) {
    // Handle envelope status tooltips
    if (envelope.status === envelopeStatuses.COMPLETED) {
      tooltip = 'This document was signed by all parties';
      if (envelope.dateCompleted) {
        tooltip += ` on ${fDateTime(envelope.dateCompleted)}`;
      }
    } else if (envelope.status === envelopeStatuses.CANCELLED) {
      tooltip = 'This document was cancelled';
      if (envelope.dateCancelled) {
        tooltip += ` on ${fDateTime(envelope.dateCancelled)}`;
      }
      if (envelope.voidReason) {
        tooltip += ` for the following reason: ${envelope.voidReason}`;
      }
    } else if (displayStatus === 'Awaiting Your Signature') {
      tooltip = 'This document is waiting for your signature';
    } else if (displayStatus.includes('Awaiting') && displayStatus.includes('Signature')) {
      tooltip = `This document is waiting for the ${displayStatus.replace('Awaiting ', '').replace(' Signature', '').toLowerCase()} to sign`;
    } else {
      tooltip = 'This document was sent to the first signer';
      if (envelope.sentAt) {
        tooltip += ` on ${fDateTime(envelope.sentAt)}`;
      }
    }
  } else {
    // Handle form status tooltips
    switch (displayStatus) {
      case 'Draft':
        tooltip = 'This form is still a draft';
        break;
      case 'Completed':
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
        tooltip = 'This form was sent';
        if (form.dateSent) {
          tooltip += ` on ${fDateTime(form.dateSent)}`;
        }
        tooltip += '. Please wait for the client to review it.';
        break;
      case 'Awaiting Advisor' as FormStatus:
        tooltip = 'This form was sent';
        if (form.dateSent) {
          tooltip += ` on ${fDateTime(form.dateSent)}`;
        }
        tooltip += '. Please wait for the advisor to review it.';
        break;
      default:
        tooltip = '';
        break;
    }
  }

  const getStatusColor = () => {
    if (envelope) {
      if (envelope.status === envelopeStatuses.COMPLETED) {
        return 'success';
      }
      if (envelope.status === envelopeStatuses.CANCELLED) {
        return 'error';
      }
      // For signature-related statuses
      if (displayStatus === 'Awaiting Your Signature') {
        return 'warning';
      }
      if (displayStatus.includes('Awaiting') && displayStatus.includes('Signature')) {
        return 'secondary';
      }
      return 'info';
    }

    return (
      (status === 'completed' && 'success') ||
      (status === 'sent' && 'warning') ||
      (status === 'cancelled' && 'error') ||
      (status === 'draft' && 'info') ||
      'default'
    );
  };

  return (
    <Tooltip title={tooltip}>
      <div>
        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={getStatusColor()}
        >
          {displayStatus}
        </Label>
      </div>
    </Tooltip>
  );
}
