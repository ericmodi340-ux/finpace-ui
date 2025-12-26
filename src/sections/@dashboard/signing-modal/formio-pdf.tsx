import { Dialog, Divider, Stack, Typography, IconButton } from '@mui/material';
import { Storage } from 'aws-amplify';
import { EnvelopeManager } from '../../../@types/envelope';
import useFullTemplate from 'hooks/useFullTemplate';
import Iconify from 'components/Iconify';
import { useCallback, useEffect, useState } from 'react';
import { getForm } from 'redux/slices/forms';
import { LoadingButton } from '@mui/lab';
import { envelopeRecipientStatuses } from 'constants/envelopes';
import { updateEnvelope } from 'redux/slices/envelopes';
import SignatureDisclosersModal from './disclosers-modal';
import { useBoolean } from 'hooks/useBoolean';
import { PDFViewer } from './pdf-viewer';
import SignatureSigner from './signature-signer';
import SignatureSelectModal from './signature-select-modal';
import { fDate } from 'utils/formatTime';
import { FormField } from '../../../@types/formBuilder';

export default function FormioPdf({
  envelope,
  signer,
  setSigner,
  preview,
}: {
  envelope: EnvelopeManager;
  signer: any;
  setSigner: (item: any) => void;
  preview: boolean;
}) {
  const { template, loading } = useFullTemplate(envelope.templateId);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [buttonText, setButtonText] = useState('Next');
  const [scale, setScale] = useState<number>(1);
  const openDisclosersModal = useBoolean(true);
  const openSignatureSelect = useBoolean();
  const [activeSignature, setActiveSignature] = useState({
    signatureBase64: '',
    initialsBase64: '',
  });

  useEffect(() => {
    async function getSignature() {
      if (!signer?.email) return;
      try {
        const signaturesJson = await Storage.get(`signatures/${signer?.email}`, {
          download: true,
        });
        // @ts-ignore
        const signatures = JSON.parse(await signaturesJson.Body.text());
        if (signatures.signature) {
          setActiveSignature({
            signatureBase64: signatures.signature,
            initialsBase64: signatures.initials,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    getSignature();
  }, [signer?.email]);

  useEffect(() => {
    let request = false;
    if (envelope?.formId && !request) {
      void getForm(envelope?.formId);
    }
    return () => {
      request = true;
    };
  }, [envelope?.formId]);

  useEffect(() => {
    const updateButtonText = () => {
      const elements = document.querySelectorAll('#sign-now-button');
      if (elements.length === 0) {
        setButtonText('Finish');
      } else {
        setButtonText('Next');
      }
    };

    // Initial check
    updateButtonText();

    // Set up a MutationObserver to listen for changes in the DOM
    const observer = new MutationObserver(updateButtonText);
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  const onFinish = useCallback(async () => {
    const signerButtons = document.querySelectorAll('#sign-now-button');
    if (!!signerButtons.length) {
      // scroll to bottom
      signerButtons[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
      return;
    }
    const newEnvelope: Partial<EnvelopeManager> = {
      recipients: {
        ...envelope.recipients,
        [signer?.roleName]: {
          ...envelope.recipients[signer?.roleName],
          signatureBase64: activeSignature.signatureBase64,
          initialsBase64: activeSignature.initialsBase64,
          signedAt: new Date(),
          status: envelopeRecipientStatuses.SIGNED,
          userAgent: navigator.userAgent,
        },
      },
      status: envelope.status,
    };
    setIsLoading(true);
    await updateEnvelope(envelope.id, newEnvelope);
    setIsLoading(false);
    setSigner(null);
    return Promise.resolve();
  }, [
    activeSignature.initialsBase64,
    activeSignature.signatureBase64,
    envelope.id,
    envelope.recipients,
    envelope.status,
    setSigner,
    signer?.roleName,
  ]);

  const handleLoadSuccess = (pages: number) => {
    setNumPages(pages);
    // Adjust scale based on container width
    const container = document.querySelector('.pdf-container');
    if (container) {
      const newScale = container.clientWidth / 612;
      setScale(Math.max(newScale, 1));
    }
  };

  const components = template?.pdfFormSchema?.components || {};

  if (loading) return <div>Loading...</div>;

  return (
    <Dialog
      fullWidth
      disableEnforceFocus
      fullScreen
      open={!!signer}
      onClose={() => setSigner(null)}
      PaperProps={{
        sx: {
          margin: '0px !important',
          backgroundColor: (theme) => theme.palette.background.neutral,
        },
      }}
    >
      <Stack
        sx={{
          position: 'relative',
          height: '100vh',
          width: '100%',
        }}
      >
        <Stack
          displayPrint="none"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: (theme) => theme.palette.background.paper,
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 5,
              py: 2,
            }}
          >
            <Typography variant="h5">
              {template?.title} {preview ? '(Preview)' : ''}
            </Typography>
            <IconButton onClick={() => setSigner(null)}>
              <Iconify icon="carbon:close" />
            </IconButton>
          </Stack>
          <Divider />
          {/* <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Divider orientation="vertical" />
            {/* <IconButton>
              {false ? <CircularProgress size={24} /> : <Iconify icon="mdi:download" />}
            </IconButton> */}
          {/* <LoadingButton
              sx={{
                minWidth: 160,
              }}
              variant="contained"
              onClick={onFinish}
              loading={isLoading}
            >
              Submit
            </LoadingButton> */}

          {/* <Divider orientation="vertical" /> */}
          {/* </Stack>  */}
          <Divider />
        </Stack>
        <Stack
          sx={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: (theme) => theme.palette.background.neutral,
            overflow: 'auto',
            my: 7,
            mt: 10,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Stack
            className="pdf-container"
            sx={{
              width: 1089.36,
            }}
          >
            <PDFViewer
              url={envelope?.pdfUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={() => console.error('error')}
              numPages={numPages}
              scale={scale}
            >
              {Object.keys(components)?.map((component: string) => (
                <RenderComponent
                  key={component}
                  component={components[component]}
                  signer={signer}
                  scale={scale}
                  preview={preview}
                  activeSignature={activeSignature}
                  onSignatureSelectOpen={openSignatureSelect.onTrue}
                />
              ))}
            </PDFViewer>
          </Stack>
        </Stack>
        <Footer buttonText={buttonText} onFinish={onFinish} isLoading={isLoading} />
      </Stack>
      {openDisclosersModal.value && (
        <SignatureDisclosersModal
          isOpen={openDisclosersModal.value}
          onAgree={() => openDisclosersModal.onFalse()}
        />
      )}
      <SignatureSelectModal
        signer={signer}
        open={openSignatureSelect.value}
        onClose={openSignatureSelect.onFalse}
        setActiveSignature={setActiveSignature}
      />
    </Dialog>
  );
}

export function Footer({
  buttonText,
  onFinish,
  isLoading,
}: {
  buttonText: string;
  onFinish: () => Promise<void>;
  isLoading: boolean;
}) {
  const onSubmit = useCallback(async () => {
    await onFinish();
  }, [onFinish]);

  return (
    <Stack
      displayPrint="none"
      sx={{
        position: 'fixed',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => theme.palette.background.paper,
        px: 5,
        py: 1,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <LoadingButton
        size="large"
        sx={{
          minWidth: 160,
        }}
        variant="contained"
        onClick={onSubmit}
        loading={isLoading}
      >
        {buttonText}
      </LoadingButton>
    </Stack>
  );
}

function RenderComponent({
  component,
  signer,
  preview,
  activeSignature,
  scale,
  onSignatureSelectOpen,
}: {
  component: FormField;
  signer: any;
  preview: boolean;
  activeSignature: { signatureBase64: string; initialsBase64: string };
  scale: number;
  onSignatureSelectOpen: () => void;
}) {
  const overlay = component?.overlay;

  if (overlay) {
    const { x, y, width, height } = overlay;

    const style: React.CSSProperties = {
      position: 'absolute',
      left: x * scale,
      top: y * scale,
      width: width * scale,
      height: height * scale,
      zIndex: 100,
    };

    if (
      (component.type === 'signature' || component.type === 'initial') &&
      component.custom?.signer?.includes(signer?.roleName)
    ) {
      return (
        <div style={style}>
          <SignatureSigner
            hideId
            isInitials={component.type === 'initial'}
            preview={preview}
            signature={
              component.type === 'initial'
                ? activeSignature.initialsBase64
                : activeSignature.signatureBase64
            }
            width={width * scale}
            height={height * scale}
            onSignatureSelectOpen={onSignatureSelectOpen}
          />
        </div>
      );
    }

    if (component.type === 'date-signed' && component?.custom?.signer?.includes(signer?.roleName)) {
      return (
        <div
          style={{
            ...style,
            width: width * scale,
          }}
        >
          <Typography
            sx={{
              fontSize: 10 * scale,
            }}
          >
            {component?.custom?.dateFormat
              ? fDate(new Date(), component?.custom?.dateFormat)
              : fDate(new Date(), 'MM/dd/yyyy')}
          </Typography>
        </div>
      );
    }
  }
  return null;
}
