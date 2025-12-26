import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

const useEnvelope = (envelopeId: string | undefined) => {
  const { envelopes } = useSelector((state) => state.envelopes);

  if (!envelopeId) {
    return;
  }
  return envelopes.find((envelope) => envelope.id === envelopeId);
};

export default useEnvelope;
