// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Tooltip } from '@mui/material';
// @types
import { FormManager } from '../../../../../@types/form';
// components
import Iconify from 'components/Iconify';
// utils
import { sortEnvelopeRecipients } from 'utils/envelopes';
import useAuth from 'hooks/useAuth';
// constants
import {
  envelopeDeliveryMethods,
  envelopeRecipients,
  envelopeRecipientStatuses,
} from 'constants/envelopes';
import { fDateTime } from 'utils/formatTime';
import { formStatuses } from '../../../../../constants/forms';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
};

export default function CombinedRecipientsCell({ form }: Props) {
  const theme = useTheme();
  const { user } = useAuth();

  // If no envelope, don't show recipients
  if (!form.envelope) {
    return <span>-</span>;
  }

  const { envelope } = form;
  const { recipients } = envelope;

  const getCurrentSignerIndex = (recipients: any): number =>
    recipients.findIndex((recipient: any) => recipient.status === formStatuses.SENT);
  const sortedRecipients = sortEnvelopeRecipients(recipients);
  const currentSignerIndex = getCurrentSignerIndex(sortedRecipients);

  return (
    <Box
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}
    >
      {sortedRecipients.map((recipient, idx) => {
        const { status, email, name, signedAt, roleName, role } = recipient;
        const recipientSigned = status === envelopeRecipientStatuses.SIGNED;

        const isNextSigner = idx === currentSignerIndex;

        const recipientName = name || email || 'This signer';

        let tooltip = '';
        if (recipientSigned) {
          tooltip = `${recipientName} signed this document`;
          if (signedAt) {
            tooltip += ` on ${fDateTime(signedAt)}`;
          }
        } else if (role === 'cc') {
          tooltip = `${recipientName} will be emailed a copy of this executed document once all signers have signed.`;
        } else if (status === envelopeRecipientStatuses.SENT) {
          if (
            envelope.deliveryMethod === envelopeDeliveryMethods.EMAIL ||
            // Firm signers are always emailed the document for signing regardless of delivery method
            (envelope.deliveryMethod === envelopeDeliveryMethods.EMBEDDED &&
              roleName === envelopeRecipients.FIRM)
          ) {
            if (isNextSigner) {
              tooltip = `${recipientName} was emailed this document for signing.`;
            } else {
              tooltip = `${recipientName} will be emailed this document for signing once previous signers have signed.`;
            }
          } else if (
            envelope.deliveryMethod === envelopeDeliveryMethods.EMBEDDED &&
            user?.role !== roles.CLIENT
          ) {
            if (isNextSigner) {
              tooltip = `${recipientName} can now sign this document.`;
            } else {
              tooltip = `An in-person signing session will be available for ${recipientName} once previous signers have signed.`;
            }
          } else {
            tooltip = `${recipientName} still has to sign.`;
          }
        } else {
          tooltip = `${recipientName} has the following signing status for this document: ${status}.`;
        }

        return (
          <Tooltip key={idx} title={tooltip}>
            <div>
              <Iconify
                icon={'eva:person-fill'}
                width={24}
                height={24}
                color={
                  recipientSigned || envelope.status === formStatuses.COMPLETED
                    ? theme.palette.primary.main
                    : theme.palette.divider
                }
              />
            </div>
          </Tooltip>
        );
      })}
    </Box>
  );
}
