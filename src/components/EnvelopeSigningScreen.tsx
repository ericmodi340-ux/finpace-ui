import { useState, useEffect, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Box, Typography, Tooltip, Stack, Card, Container } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'components/Iconify';
// hooks
import useEnvelope from 'hooks/useEnvelope';
// constants
import { envelopeRecipientStatuses } from 'constants/envelopes';
import useSigningWindow from '../hooks/useSigningWindow';
import { FormManager } from '../@types/form';
import { TemplateWithFieldsManager } from '../@types/template';
import SigningDocumentModal from 'sections/@dashboard/signing-modal/signing-document-modal';
import FormioPdf from 'sections/@dashboard/signing-modal/formio-pdf';

// ----------------------------------------------------------------------

const getDescriptionFromSignerID = (id: string) => {
  let name;
  switch (id) {
    case 'client_1':
      name = 'Primary Investor';
      break;
    case 'client_2':
      name = 'Joint Investor';
      break;
    case 'advisor':
      name = 'Advisor';
      break;
    case 'firm':
      name = 'Firm';
      break;
    default:
      name = 'Signer';
      break;
  }
  return name;
};

// ----------------------------------------------------------------------

export default function EnvelopeSigningScreen({
  envelopeId,
  onComplete,
  loading,
  goBack,
  currentForm,
  template,
}: {
  envelopeId: string | undefined;
  onComplete?: VoidFunction;
  loading: boolean;
  goBack: VoidFunction;
  currentForm: FormManager;
  template: TemplateWithFieldsManager;
}) {
  const theme = useTheme();
  const envelope = useEnvelope(envelopeId);
  const [capturedSigners, setCapturedSigners] = useState<string[]>([]);
  const [isEnvelopeVoided, setIsEnvelopeVoided] = useState(false);
  const [currSigner, setCurrSigner] = useState<any>(null);
  const [currSignerPdfForm, setCurrSignerPdfForm] = useState<any>(null);

  const { urlLoading, currentSigner, openSigningWindow, signingWindows } =
    useSigningWindow(envelope);

  const closePopup = useCallback(
    (event: any) => {
      const { data, origin: popupOrigin } = event;
      if (
        popupOrigin !== window.origin ||
        !data ||
        data.source === 'react-devtools-bridge' ||
        data.source === 'react-devtools-content-script' ||
        data.source === '@devtools-page'
      ) {
        return;
      }

      try {
        const { signerId, event } = JSON.parse(data);
        if (event === 'decline' || event === 'id_check_failed') {
          setIsEnvelopeVoided(true);
        } else if (!capturedSigners.includes(signerId)) {
          console.debug(`adding ${signerId} to capturedSigners`);
          setCapturedSigners((cs) => [...cs, signerId]);
        }
        if (signingWindows[signerId] && !signingWindows[signerId].closed) {
          signingWindows[signerId].close();
        }
      } catch (err) {
        console.error(err);
      }
    },
    [capturedSigners, signingWindows]
  );

  // Handle closing of signing windows from /esign-callback page message
  useEffect(() => {
    window.addEventListener('message', closePopup);
    return () => {
      window.removeEventListener('message', closePopup);
    };
  }, [closePopup]);

  const getSigners = () => {
    if (envelope?.recipients && Object.keys(envelope?.recipients).length) {
      let { recipients } = envelope;
      //Filter Signers with role CC
      const onlySigners: { [key: string]: {} } = {};
      // eslint-disable-next-line array-callback-return
      Object.entries(recipients).filter(([key, item]) => {
        if (item && item.role !== 'cc') {
          onlySigners[key] = item;
        }
      });

      let signerButtons = Object.keys(onlySigners)
        .filter((signerID) => recipients[signerID]?.role === 'signer')
        .sort((a, b) => {
          const signerA = recipients[a];
          const signerB = recipients[b];
          return parseInt(signerA!.routingOrder) - parseInt(signerB!.routingOrder);
        })
        .map((signerID) => {
          const signer = recipients[signerID];
          const completedSigner =
            (signer && signer.status === envelopeRecipientStatuses.SIGNED) ||
            capturedSigners.includes(signerID);
          return { ...recipients[signerID], completedSigner, signerID };
        });
      return signerButtons;
    }
    return [];
  };

  const signingButtons = getSigners();
  const nextSigner = signingButtons.find((signer) => !signer.completedSigner);

  // Increase step when all in-person signers have signed
  useEffect(() => {
    const completedSigners = signingButtons.filter((signer) => signer.completedSigner);
    if (completedSigners.length === signingButtons.length) {
      onComplete && onComplete();
    }
  }, [onComplete, signingButtons]);

  useEffect(() => {
    if (isEnvelopeVoided) {
      onComplete && onComplete();
    }
  }, [onComplete, isEnvelopeVoided]);

  if (!envelope) {
    return (
      <Alert severity="error">
        <AlertTitle>Document not found</AlertTitle>
        We could not find this document. Please check it and contact Bitsy if the problem persists.
      </Alert>
    );
  }

  const { recipients } = envelope;

  if (!recipients || !Object.keys(recipients).length) {
    return (
      <Alert severity="error">
        <AlertTitle>Recipients not found</AlertTitle>
        We could not get the recipients for this document. Please contact Bitsy if the problem
        persists.
      </Alert>
    );
  }

  return (
    <>
      <MContainer>
        <Stack spacing={2} mx="auto" width={300}>
          {signingButtons.map((signer) => {
            const { recipientId, completedSigner, signerID, name, email } = signer;
            const isNextSigner = recipientId === nextSigner?.recipientId;
            const styles = {
              color: 'black',
            };

            return (
              <Tooltip
                key={recipientId}
                title={isNextSigner ? '' : `Preview the signing experience for ${name || email}`}
              >
                <Box sx={{ display: 'flex' }}>
                  <LoadingButton
                    sx={{
                      ...styles,
                      '&:hover': styles,
                      '&:disabled': styles,
                      flex: 1,
                      height: 'auto',
                      backgroundColor: 'transparent',
                    }}
                    size={'large'}
                    key={recipientId}
                    variant={completedSigner ? 'contained' : 'outlined'}
                    loading={urlLoading && currentSigner === recipientId}
                    disabled={completedSigner || !isNextSigner}
                    onClick={() => {
                      if (!completedSigner) {
                        if (
                          template?.signingEventType === undefined ||
                          template.signingEventType === 'docusign'
                        ) {
                          //@ts-ignore
                          openSigningWindow(signerID, recipientId);
                        }
                        if (template.signingEventType === 'finpaceDynamicSign') {
                          setCurrSigner(signer);
                        }
                        if (template.signingEventType === 'finpaceSign') {
                          setCurrSignerPdfForm(signer);
                        }
                      }
                    }}
                    startIcon={
                      <Iconify
                        icon={
                          completedSigner
                            ? 'eva:checkmark-circle-outline'
                            : 'eva:alert-circle-outline'
                        }
                        style={{ fontSize: '27px', color: completedSigner ? 'success' : 'error' }}
                        color={
                          completedSigner ? theme.palette.success.main : theme.palette.error.main
                        }
                      />
                    }
                    data-test={`envelope-signer-button-${signerID}`}
                  >
                    <Box>
                      <Typography variant="subtitle1">{name || email}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {getDescriptionFromSignerID(signerID)}
                      </Typography>
                    </Box>
                  </LoadingButton>
                </Box>
              </Tooltip>
            );
          })}

          <LoadingButton
            type="button"
            onClick={goBack}
            loading={loading}
            sx={{ flex: 1, mt: 5, marginX: 'auto', textTransform: 'none' }}
            data-test="form-crm-skip-button"
          >
            Back to options
          </LoadingButton>
        </Stack>
      </MContainer>

      {envelope && currSigner && currentForm && (
        <SigningDocumentModal
          preview={false}
          envelope={envelope}
          setSigner={setCurrSigner}
          signer={currSigner}
        />
      )}

      {envelope && currSignerPdfForm && currentForm && (
        <FormioPdf
          preview={false}
          envelope={envelope}
          setSigner={setCurrSignerPdfForm}
          signer={currSignerPdfForm}
        />
      )}
    </>
  );
}

const MContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: { xs: '100%', md: 600 },
      mx: 'auto',
      my: {
        xs: 'auto',
        md: 10,
      },
      minHeight: '210px',
    }}
  >
    <Container maxWidth="sm">
      <Card sx={{ p: 5 }}>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
          variant="h4"
          gutterBottom
        >
          Sign the Document
        </Typography>
        {children}
      </Card>
    </Container>
  </Box>
);
