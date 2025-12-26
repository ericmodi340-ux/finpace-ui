import LoadingScreen from 'components/LoadingScreen';
import useEnvelope from 'hooks/useEnvelope';
import Page404 from 'pages/Page404';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getEnvelopes } from 'redux/slices/envelopes';
import { useDispatch, useSelector } from 'redux/store';
import { PATH_DASHBOARD } from 'routes/paths';
import FormioPdf from 'sections/@dashboard/signing-modal/formio-pdf';
import SigningDocumentModal from 'sections/@dashboard/signing-modal/signing-document-modal';

export default function EnvelopeDocumentView() {
  const { envelopeId, signerId = '' } = useParams();
  const navigate = useNavigate();

  const { loaded, isLoading } = useSelector((state) => state.envelopes);
  const dispatch = useDispatch();

  useEffect(() => {
    !loaded && dispatch(getEnvelopes());
  }, [dispatch, loaded]);

  const envelope = useEnvelope(envelopeId);

  const onClose = () => {
    navigate(PATH_DASHBOARD.root);
  };

  const signer = envelope?.recipients?.[signerId] || 'viewOnly';

  if (isLoading) return <LoadingScreen />;

  if (!envelope) return <Page404 />;

  const { signingEventType = 'docusign' } = envelope;

  if (signingEventType === 'docusign') return <Navigate to={PATH_DASHBOARD.root} />;

  if (signer !== 'viewOnly') {
    if (signingEventType === 'finpaceDynamicSign') {
      return (
        <>
          <Helmet>
            <title>Signing Document</title>
          </Helmet>
          <SigningDocumentModal
            signer={signer}
            envelope={envelope}
            preview={false}
            setSigner={onClose}
          />
        </>
      );
    }

    if (signingEventType === 'finpaceSign') {
      return (
        <>
          <Helmet>
            <title>Signing Document</title>
          </Helmet>
          <FormioPdf preview={false} envelope={envelope} setSigner={onClose} signer={signer} />
        </>
      );
    }

    return null;
  }

  return (
    <>
      <Helmet>
        <title>Signing Document</title>
      </Helmet>
      {signingEventType === 'finpaceDynamicSign' && (
        <SigningDocumentModal
          signer={signer}
          envelope={envelope}
          preview={true}
          setSigner={onClose}
        />
      )}
      {signingEventType === 'finpaceSign' && (
        <FormioPdf preview={true} envelope={envelope} setSigner={onClose} signer={signer} />
      )}
    </>
  );
}
