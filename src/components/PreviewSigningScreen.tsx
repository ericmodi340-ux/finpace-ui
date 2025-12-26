// @mui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Box, Typography, Tooltip, Stack, Container, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'components/Iconify';
// hooks
import useEnvelope from 'hooks/useEnvelope';
// constants
import { envelopeFinalizeTypes, envelopeRecipientStatuses } from 'constants/envelopes';
import useSigningWindow from '../hooks/useSigningWindow';
import { EnvelopeDeliveryMethod, EnvelopeFinalizeType } from '../@types/envelope';
import { FormManager } from '../@types/form';
import { TemplateWithFieldsManager } from '../@types/template';
import { useState } from 'react';
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

export default function PreviewSigningScreen({
  envelopeId,
  loading,
  handleAfterPreview,
  currentLoadingButton,
  goBack,
  currentForm,
  template,
}: {
  envelopeId: string | undefined;
  loading: boolean;
  handleAfterPreview: (
    buttonId: string,
    id: string,
    envelopeDeliveryMethods: EnvelopeDeliveryMethod
  ) => void;
  currentLoadingButton: string;
  goBack: VoidFunction;
  currentForm: FormManager;
  template: TemplateWithFieldsManager;
}) {
  const theme = useTheme();
  const envelope = useEnvelope(envelopeId);
  const [currSigner, setCurrSigner] = useState<any>(null);
  const [currSignerPdfForm, setCurrSignerPdfForm] = useState<any>(null);

  const { urlLoading, currentSigner, openSigningWindow } = useSigningWindow(envelope);

  const getSigners = () => {
    if (envelope?.recipients && Object.keys(envelope?.recipients).length) {
      let { recipients } = envelope;
      let signerButtons = Object.keys(recipients)
        .filter((signerID) => recipients[signerID]?.role === 'signer')
        .sort((a, b) => {
          const signerA = recipients[a];
          const signerB = recipients[b];
          return parseInt(signerA!.routingOrder) - parseInt(signerB!.routingOrder);
        })
        .map((signerID) => {
          const signer = recipients[signerID];
          const completedSigner = signer && signer.status === envelopeRecipientStatuses.SIGNED;
          return { ...recipients[signerID], completedSigner, signerID };
        });
      return signerButtons;
    }
    return [];
  };

  const signingButtons = getSigners();
  const nextSigner = signingButtons.find((signer) => !signer.completedSigner);

  // Increase step when all in-person signers have signed

  const ENVELOPE_FINALIZE_OPTIONS = [
    {
      id: envelopeFinalizeTypes.SEND as EnvelopeFinalizeType.SEND,
      title: 'Send for signing',
      tooltip: 'Email the final document for signing and update the client in any integrations',
      icon: 'eva:email-fill',
      handleClick: (buttonId: string, id: string) =>
        handleAfterPreview(buttonId, id, EnvelopeDeliveryMethod.EMAIL),
      comingSoon: false,
    },
    {
      id: envelopeFinalizeTypes.SIGN as EnvelopeFinalizeType.SIGN,
      title: 'Sign now',
      tooltip: 'Initiate an in-person signing session and update the client in any integrations',
      icon: 'eva:edit-fill',
      handleClick: (buttonId: string, id: string) =>
        handleAfterPreview(buttonId, id, EnvelopeDeliveryMethod.EMBEDDED),
      comingSoon: false,
    },
  ];

  if (!envelope) {
    return (
      <Alert severity="error">
        <AlertTitle>Preview document not found</AlertTitle>
        We could not find this preview document. Please check it and contact Finpace if the problem
        persists.
      </Alert>
    );
  }

  return (
    <>
      <MContainer>
        <Stack spacing={2} alignItems="center">
          {signingButtons.map((signer) => {
            const { recipientId, completedSigner, signerID, name, email } = signer;
            const isNextSigner = recipientId === nextSigner?.recipientId;
            const styles = {
              color: 'black',
            };

            return (
              <Tooltip
                key={recipientId}
                title={isNextSigner ? '' : 'Previous signers must sign first'}
              >
                <Box sx={{ my: 1, display: 'flex', width: '277px' }}>
                  <LoadingButton
                    sx={{
                      ...styles,
                      '&:hover': styles,
                      flex: 1,
                      height: 'auto',
                      backgroundColor: 'transparent',
                    }}
                    size={'large'}
                    key={recipientId}
                    variant={'outlined'}
                    disabled={loading || completedSigner}
                    loading={urlLoading && currentSigner === recipientId}
                    onClick={() => {
                      if (!completedSigner) {
                        if (
                          template?.signingEventType === undefined ||
                          template?.signingEventType === 'docusign'
                        ) {
                          //@ts-ignore
                          openSigningWindow(signerID, recipientId);
                        }
                        if (template?.signingEventType === 'finpaceDynamicSign') {
                          setCurrSigner(signer);
                        }
                        if (template?.signingEventType === 'finpaceSign') {
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
                          loading
                            ? 'grey.300'
                            : completedSigner
                              ? theme.palette.success.main
                              : theme.palette.error.main
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
        </Stack>
        <Stack mt={2} spacing={2} alignItems="center">
          {ENVELOPE_FINALIZE_OPTIONS.map((option) => (
            <Tooltip
              key={option.id}
              title={option.comingSoon ? `Coming soon! ${option.tooltip}` : option.tooltip}
              placement="right"
            >
              <Box sx={{ margin: 'auto', width: '277px' }}>
                <LoadingButton
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon={option.icon} />}
                  sx={{ textTransform: 'none', width: '100%' }}
                  disabled={loading}
                  loading={Boolean(loading) && currentLoadingButton === option?.id}
                  onClick={() => option.handleClick(option?.id, envelope.id)}
                  data-test={`form-finalize-option-${option.id}`}
                >
                  {option.title}
                </LoadingButton>
              </Box>
            </Tooltip>
          ))}
          <LoadingButton
            type="button"
            loading={
              loading &&
              currentLoadingButton !== envelopeFinalizeTypes.SEND &&
              currentLoadingButton !== envelopeFinalizeTypes.SIGN
            }
            onClick={goBack}
            sx={{ flex: 1, mt: 2, mx: 'auto', textTransform: 'none' }}
            data-test="form-crm-skip-button"
          >
            Back to options
          </LoadingButton>
        </Stack>
      </MContainer>
      {envelope && currSigner && currentForm && (
        <SigningDocumentModal
          preview
          envelope={envelope}
          setSigner={setCurrSigner}
          signer={currSigner}
        />
      )}

      {envelope && currSignerPdfForm && currentForm && (
        <FormioPdf
          preview
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
          Preview Documents for:
        </Typography>
        {children}
      </Card>
    </Container>
  </Box>
);
