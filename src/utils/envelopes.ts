// @types
import {
  EnvelopeRecipients,
  EnvelopeRecipient,
  EnvelopeManager,
  EnvelopeStatus,
} from '../@types/envelope';
import { envelopeStatuses } from 'constants/envelopes';

// ----------------------------------------------------------------------

export function sortEnvelopeRecipients(recipients: EnvelopeRecipients) {
  const sortedRecipients = Object.entries(recipients)
    //@ts-ignore
    .filter(([signerID, recipient]): recipient is EnvelopeRecipient => !!recipient)
    .sort(
      //@ts-ignore
      (a: [string, EnvelopeRecipient], b: [string, EnvelopeRecipient]) =>
        Number(a[1].routingOrder) - Number(b[1].routingOrder)
    )
    .map(([signerID, recipient]) => ({ ...recipient, signerID }));

  return sortedRecipients;
}

export const getSigningStatus = (envelope: EnvelopeManager) => {
  if (
    envelope.status === envelopeStatuses.COMPLETED ||
    envelope.status === envelopeStatuses.CANCELLED
  ) {
    return envelope.status;
  }
  if (
    envelope.recipients.client_1?.status === envelopeStatuses.SENT ||
    envelope.recipients.client_2?.status === envelopeStatuses.SENT
  ) {
    return 'Awaiting Client' as EnvelopeStatus;
  }
  return 'Awaiting Advisor' as EnvelopeStatus;
};
