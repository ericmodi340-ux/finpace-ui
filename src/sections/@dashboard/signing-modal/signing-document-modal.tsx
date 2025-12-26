import { Storage } from 'aws-amplify';
import { EnvelopeManager } from '../../../@types/envelope';
import { useBoolean } from 'hooks/useBoolean';
import useFullTemplate from 'hooks/useFullTemplate';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SignatureSigner from './signature-signer';
import { envelopeRecipientStatuses } from 'constants/envelopes';
import SignatureImage from './signature-image';
import {
  Divider,
  Typography,
  Dialog,
  Stack,
  IconButton,
  Container,
  CircularProgress,
} from '@mui/material';
import { getDocumentS3Url, updateEnvelope } from 'redux/slices/envelopes';
import Iconify from 'components/Iconify';
import LoadingScreen from 'components/LoadingScreen';
import { LoadingButton } from '@mui/lab';
import DocumentRenderer from './document-renderer';
import SignatureSelectModal from './signature-select-modal';
import './signing-modal.css';
import useForm from 'hooks/useForm';
import { getForm } from 'redux/slices/forms';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { getClientName } from 'utils/clients';
import useUserFromStore from 'hooks/useUserFromStore';
import { UserRole } from '../../../@types/user';
import { ClientManager } from '../../../@types/client';
import { roles } from 'constants/users';
import { fDate } from 'utils/formatTime';
import SignatureDisclosersModal from './disclosers-modal';
import { AdvisorManager } from '../../../@types/advisor';
import { useSelector } from 'redux/store';
import { EditorCore } from '';
import mjml2html from 'mjml-browser';

function flattenObject(obj: any, prefix = '') {
  let result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flattenObject(item, `${newKey}[${index}]`));
        } else {
          result[`${newKey}[${index}]`] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

export default function SigningDocumentModal({
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
  const [isDownloading, setisDownloading] = useState(false);
  const [activeSignature, setActiveSignature] = useState({
    signatureBase64: '',
    initialsBase64: '',
  });
  const openSignatureSelect = useBoolean();
  const openDisclosersModal = useBoolean(true);
  const componentRef = useRef<HTMLDivElement>(null);
  const { template, loading } = useFullTemplate(envelope.templateId);
  const currentform = useForm(envelope?.formId);
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  const client = useUserFromStore(
    currentform?.clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;

  const advisor = useUserFromStore(
    currentform?.advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;

  const { firm } = useSelector((state: any) => state.firm);

  const submissionData = useMemo(() => {
    const data = { ...currentform?.submission?.[`${currentform?.templateId}::0`] };

    const {
      firstName,
      middleInitial,
      lastName,
      secondInvestor: {
        firstName: second_investor_firstName_v2,
        middleInitial: second_investor_middleInitial_v2,
        lastName: second_investor_lastName_v2,
      } = {} as any,
    } = data as any;

    const firstInvestorName =
      getClientName({
        first: firstName,
        middle: middleInitial,
        last: lastName,
      }) || client?.name;

    const secondInvestorName =
      getClientName({
        first: second_investor_firstName_v2,
        middle: second_investor_middleInitial_v2,
        last: second_investor_lastName_v2,
      }) || client?.secondInvestor?.name;

    let compositeName = firstInvestorName;
    if (data?.includeSecondInvestor) {
      compositeName += ` & ${secondInvestorName}`;
    }

    return {
      ...data,
      gwn_funds_allocated: client?.custom?.gwn_funds_allocated,
      compositeName,
      name: firstInvestorName || '',
      email: client?.email,
      secondInvestor: {
        ...(data?.secondInvestor || {}),
        email: data?.secondInvestor?.email || client?.secondInvestor?.email,
        name: secondInvestorName,
      },
      currentDate: fDate(new Date(), 'MM/dd/yyyy'),
      contractDate: envelope.sentAt
        ? fDate(new Date(envelope.sentAt), 'MM/dd/yyyy')
        : fDate(new Date(), 'MM/dd/yyyy'),
      advisor: {
        name: advisor?.name,
        email: advisor?.email,
        phoneNumber: advisor?.phoneNumber,
        masterAccountNumber: advisor?.masterAccountNumber,
      },
      firm: { name: firm.name, email: firm.email, schwabServiceTeam: firm?.schwabServiceTeam },
    };
  }, [
    advisor?.email,
    advisor?.masterAccountNumber,
    advisor?.name,
    advisor?.phoneNumber,
    client?.custom?.gwn_funds_allocated,
    client?.email,
    client?.name,
    client?.secondInvestor?.email,
    client?.secondInvestor?.name,
    currentform?.submission,
    currentform?.templateId,
    envelope.sentAt,
    firm.email,
    firm.name,
    firm?.schwabServiceTeam,
  ]);

  const { enqueueSnackbar } = useSnackbar();
  const [buttonText, setButtonText] = useState('Next');

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

  const getReplacements = useCallback(
    (submissionData: any) => {
      const newSubmissionData = flattenObject(submissionData);

      const replacements: any = Object.keys(newSubmissionData).map((key) => ({
        text: key,
        component: () =>
          typeof newSubmissionData[key] === 'string' || typeof newSubmissionData[key] === 'number'
            ? newSubmissionData[key]
            : '',
      }));

      Object.keys(envelope.recipients).forEach((signerID) => {
        if (signer?.roleName && signerID === signer?.roleName) {
          replacements.push(
            {
              text: `${signerID}__**signHere**`,
              component: () => (
                <SignatureSigner
                  preview={preview}
                  signature={activeSignature.signatureBase64 || ''}
                  onSignatureSelectOpen={openSignatureSelect.onTrue}
                />
              ),
            },
            {
              text: `${signerID}__**initialHere**`,
              component: () => (
                <SignatureSigner
                  preview={preview}
                  signature={activeSignature.initialsBase64 || ''}
                  onSignatureSelectOpen={openSignatureSelect.onTrue}
                  isInitials
                />
              ),
            },
            {
              text: `${signerID}__**dateSigned**`,
              component: () => (
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  {new Date().toLocaleDateString()}
                </Typography>
              ),
            }
          );
        } else if (
          signerID !== signer?.signerID &&
          envelope.recipients[signerID]?.status === envelopeRecipientStatuses.SIGNED
        ) {
          replacements.push(
            {
              text: `${signerID}__**signHere**`,
              component: () => (
                <SignatureImage signature={envelope.recipients[signerID]?.signatureBase64 || ''} />
              ),
            },
            {
              text: `${signerID}__**initialHere**`,
              component: () => (
                <SignatureImage signature={envelope.recipients[signerID]?.initialsBase64 || ''} />
              ),
            },
            {
              text: `${signerID}__**dateSigned**`,
              component: () => (
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  {envelope?.recipients?.[signerID]?.signedAt !== undefined
                    ? new Date(
                        envelope?.recipients?.[signerID]?.signedAt || ''
                      ).toLocaleDateString()
                    : ''}
                </Typography>
              ),
            }
          );
        } else if (signerID !== signer?.signerID && envelope.recipients[signerID]?.role === 'cc') {
          replacements.push({
            text: `${signerID}__**dateSigned**`,
            component: () => (
              <Typography
                variant="subtitle1"
                sx={{
                  color: (theme) => theme.palette.text.primary,
                }}
              >
                {new Date().toLocaleDateString()}
              </Typography>
            ),
          });
        } else if (
          signerID !== signer?.signerID &&
          envelope.recipients[signerID]?.status !== envelopeRecipientStatuses.SIGNED &&
          envelope.recipients[signerID]?.role !== 'cc'
        ) {
          replacements.push(
            {
              text: `${signerID}__**signHere**`,
              component: () => '',
            },
            {
              text: `${signerID}__**initialHere**`,
              component: () => '',
            },
            {
              text: `${signerID}__**dateSigned**`,
              component: () => '',
            }
          );
        }
      });

      return replacements;
    },
    [activeSignature, envelope, openSignatureSelect.onTrue, preview, signer]
  );

  const replacements = useMemo(
    () => getReplacements(submissionData || {}),
    [submissionData, getReplacements]
  );

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
          location: location || 'Location not provided',
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
    location,
    setSigner,
    signer?.roleName,
  ]);

  const handleDownloadDocument = async (envelopeId: string) => {
    try {
      setisDownloading(true);
      const getS3Url = await getDocumentS3Url(envelopeId, 'combined');
      const s3Url = getS3Url.url;

      // Make blob for download pdf
      const response = await axios.get(s3Url, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${template?.title || new Date().toLocaleDateString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      setisDownloading(false);
    } catch (error) {
      console.error(error);
      setisDownloading(false);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

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

  const htmlData = useMemo(() => {
    if (!template?.projectJson) return '';
    const mjmlString = EditorCore.toMJML({
      element: template?.projectJson?.content,
      mode: 'production',
      beautify: true,
    });
    const { html } = mjml2html(mjmlString, {});
    const fullhtml = html.replace(new RegExp('{{(.*?)}}', 'g'), (match) => {
      if (
        match.includes('*signHere*') ||
        match.includes('*initialHere*') ||
        match.includes('*dateSigned*') ||
        match.includes('*fullName*')
      ) {
        return match;
      }
      const variable = match.replace('{{', '').replace('}}', '').trim();
      const newSubmissionData = flattenObject(submissionData);
      if (typeof newSubmissionData?.[variable] === 'boolean') {
        return newSubmissionData?.[variable] ? 'Yes' : 'No';
      }
      return newSubmissionData?.[variable] || ''; // TODO: change this json path
    });
    return fullhtml;
  }, [submissionData, template?.projectJson]);

  return (
    <>
      <Dialog fullScreen open={!!signer} onClose={() => setSigner(null)}>
        <Stack
          displayPrint="none"
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: (theme) => theme.palette.background.paper,
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
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Divider orientation="vertical" />
            <IconButton onClick={() => handleDownloadDocument(envelope.id)}>
              {isDownloading ? <CircularProgress size={24} /> : <Iconify icon="mdi:download" />}
            </IconButton>
            <Divider orientation="vertical" />
          </Stack>
          <Divider />
        </Stack>
        {loading || !template || !currentform ? (
          <LoadingScreen />
        ) : (
          <Stack
            sx={{
              flex: 1,
              backgroundColor: (theme) => theme.palette.background.neutral,
              py: 5,
              pb: 15,
            }}
          >
            <Container
              ref={componentRef}
              sx={{
                flex: 1,
                py: 5,
                backgroundColor: (theme) => theme.palette.background.paper,
              }}
              maxWidth="lg"
            >
              <DocumentRenderer htmlString={htmlData || ''} replacements={replacements} />
            </Container>
            {!preview && (
              <Footer isLoading={isLoading} onFinish={onFinish} buttonText={buttonText} />
            )}
          </Stack>
        )}
      </Dialog>
      <SignatureSelectModal
        signer={signer}
        open={openSignatureSelect.value}
        onClose={openSignatureSelect.onFalse}
        setActiveSignature={setActiveSignature}
      />
      {openDisclosersModal.value && (
        <SignatureDisclosersModal
          isOpen={openDisclosersModal.value}
          onAgree={() => openDisclosersModal.onFalse()}
        />
      )}
    </>
  );
}

function Footer({
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
