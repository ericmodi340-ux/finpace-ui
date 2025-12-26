import { useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { MenuItem, IconButton, Typography, Tooltip } from '@mui/material';
// @types
import {
  EnvelopeManager,
  EnvelopeRecipient,
  EnvelopeSigner,
  EnvelopeStatus,
} from '../../../../@types/envelope';
// redux
import { getDocumentS3Url, resendSigningEmail, updateEnvelope } from 'redux/slices/envelopes';
// components
import Iconify from 'components/Iconify';
import {
  envelopeRecipientStatuses,
  envelopeRecipients,
  envelopeStatuses,
} from 'constants/envelopes';
// sections
import axios from 'axios';
import useTemplate from 'hooks/useTemplate';
import { getTemplateName } from 'utils/templates';
import { sortEnvelopeRecipients } from 'utils/envelopes';
import { formStatuses } from 'constants/forms';
import { roles } from 'constants/users';
import useAuth from 'hooks/useAuth';
import useSigningWindow from 'hooks/useSigningWindow';
import CancelReasonModal from 'sections/@dashboard/form/list/CancelReasonModal';
import CustomPopover, { usePopover } from 'components/custom-popover';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type Props = {
  envelope: EnvelopeManager;
  isLoading: boolean;
};

export default function EnvelopeMoreMenu({ envelope, isLoading }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const ref = useRef(null);

  const navigate = useNavigate();

  const popover = usePopover();
  const [loading, setLoading] = useState(false);
  const [showVoidReasonModal, setShowVoidReasonModal] = useState(false);
  const [currentEmailSigner, setCurrentEmailSigner] = useState<string | undefined>(undefined);
  // @ts-ignore
  const template = useTemplate(envelope?.templateId);

  const templateName = getTemplateName(template);
  const { recipients, id: envelopeId } = envelope;
  const { user } = useAuth();

  const getCurrentSignerIndex = (recipients: any): number =>
    recipients.findIndex((recipient: any) => recipient.status === formStatuses.SENT);
  const sortedRecipients = sortEnvelopeRecipients(recipients);
  const currentSignerIndex = getCurrentSignerIndex(sortedRecipients);

  const handleCancelEnvelope = async (envelopeId: string, voidReason: string) => {
    try {
      const newEnvelope = {
        status: envelopeStatuses.CANCELLED as EnvelopeStatus.CANCELLED,
        voidReason,
      };
      await updateEnvelope(envelopeId, newEnvelope);
      enqueueSnackbar('Document cancelled', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };
  const { urlLoading, currentRoleName, openSigningWindow } = useSigningWindow(envelope);

  const handleCompleteEnvelope = async (envelopeId: string) => {
    try {
      const newEnvelope = {
        status: envelopeStatuses.COMPLETED as EnvelopeStatus.COMPLETED,
      };
      await updateEnvelope(envelopeId, newEnvelope);
      enqueueSnackbar('Document completed!', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleDownloadDocument = async (envelopeId: string) => {
    try {
      const getS3Url = await getDocumentS3Url(envelopeId, 'combined');
      const s3Url = getS3Url.url;

      // Make blob for download pdf
      const response = await axios.get(s3Url, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${templateName || 'NoNameFound'}.pdf`);
      document.body.appendChild(link);
      link.click();
      popover.onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const { signingEventType = 'docusign' } = envelope;

  if (
    envelope.status === envelopeStatuses.COMPLETED ||
    envelope.status === envelopeStatuses.CANCELLED
  ) {
    return (
      <>
        <IconButton onClick={popover.onOpen}>
          <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
        </IconButton>
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          PaperProps={{
            sx: { px: 1, width: 200, color: 'text.secondary' },
          }}
        >
          <MenuItem
            onClick={() => handleDownloadDocument(envelope.id)}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:download-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Download
          </MenuItem>
        </CustomPopover>
      </>
    );
  }

  const resendEmail = async (roleName: string | undefined) => {
    setLoading(true);
    try {
      setCurrentEmailSigner(roleName);
      envelopeId && roleName && (await resendSigningEmail(envelopeId, roleName));
      enqueueSnackbar('Signing email resent!', { variant: 'success' });
      setCurrentEmailSigner('');
      setLoading(false);
      popover.onClose();
    } catch (err) {
      setLoading(false);
      popover.onClose();
    }
  };

  const handleSigning = async (recipient: EnvelopeRecipient) => {
    const { roleName, recipientId } = recipient;

    if (signingEventType === 'docusign') {
      setLoading(true);
      try {
        // @ts-ignore
        openSigningWindow(roleName, recipientId);
        setLoading(false);
        popover.onClose();
      } catch {
        setLoading(false);
        popover.onClose();
      }
    }
    if (signingEventType === 'finpaceDynamicSign') {
      navigate(PATH_DASHBOARD.esign.envelope(envelope.id, roleName));
    }
    if (signingEventType === 'finpaceSign') {
      navigate(PATH_DASHBOARD.esign.envelope(envelope.id, roleName));
    }
  };

  return (
    <>
      <IconButton ref={ref} onClick={popover.onOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          minWidth: 200,
        }}
      >
        {sortedRecipients
          .filter((recipient) => recipient.role !== 'cc')
          .map((recipient, idx) => {
            const recipientSigned = recipient.status === envelopeRecipientStatuses.SIGNED;

            const isNextSigner = idx === currentSignerIndex;
            const completedSigner = recipient?.status === envelopeRecipientStatuses.SIGNED;

            const recipientName = recipient.name || recipient.email || 'This signer';

            const isDisabled =
              recipient.role === 'cc' ||
              completedSigner ||
              !isNextSigner ||
              isLoading ||
              loading ||
              (user?.role === roles.CLIENT &&
                recipient.roleName &&
                ![EnvelopeSigner.FIRST_INVESTOR, EnvelopeSigner.SECOND_INVESTOR].includes(
                  recipient.roleName
                ));

            if (recipientSigned) {
              return (
                <Tooltip key={idx + 'sign'} title={`${recipientName} signed this document`}>
                  <MenuItem sx={{ borderRadius: 1, typography: 'body2' }} disabled={isDisabled}>
                    <Iconify
                      icon={
                        (urlLoading && currentRoleName === recipient?.roleName) ||
                        currentEmailSigner === recipient?.roleName
                          ? 'eva:clock-outline'
                          : 'eva:person-fill'
                      }
                      mr={2}
                      height={24}
                    />
                    <Typography variant="body2">{`${recipientName} Signed`}</Typography>
                  </MenuItem>
                </Tooltip>
              );
            }

            if (recipient?.roleName === envelopeRecipients.FIRM) {
              return (
                <Tooltip
                  key={idx + 'sign'}
                  title={
                    isNextSigner
                      ? `${recipientName} was emailed this document for signing. Click to resend their signing email.`
                      : `${recipientName} will be emailed this document for signing once previous signers have signed.`
                  }
                >
                  <MenuItem
                    onClick={() => resendEmail(recipient.roleName)}
                    sx={{ borderRadius: 1, typography: 'body2' }}
                    disabled={isDisabled}
                  >
                    <Iconify
                      icon={
                        (urlLoading && currentRoleName === recipient?.roleName) ||
                        currentEmailSigner === recipient?.roleName
                          ? 'eva:clock-outline'
                          : 'eva:person-fill'
                      }
                      mr={2}
                      height={24}
                    />
                    <Typography variant="body2">{`Resend to ${recipientName}`}</Typography>
                  </MenuItem>
                </Tooltip>
              );
            }

            if (user?.role !== roles.CLIENT) {
              return (
                <div key={idx + 'sign'}>
                  <Tooltip
                    key={idx + 'sign1'}
                    title={
                      isNextSigner
                        ? `${recipientName} can now sign this document. Click to initiate their in-person signing session.`
                        : `${recipientName} will be emailed this document for signing once previous signers have signed.`
                    }
                  >
                    <MenuItem
                      // @ts-ignore
                      onClick={() => handleSigning(recipient)}
                      sx={{ borderRadius: 1, typography: 'body2' }}
                      disabled={isDisabled}
                    >
                      <Iconify
                        icon={
                          (urlLoading && currentRoleName === recipient?.roleName) ||
                          currentEmailSigner === recipient?.roleName
                            ? 'eva:clock-outline'
                            : 'eva:person-fill'
                        }
                        mr={2}
                      />

                      <Typography variant="body2">{`Sign now for ${recipientName}`}</Typography>
                    </MenuItem>
                  </Tooltip>
                  <Tooltip key={idx + 'sign2'} title={`Resend to ${recipientName}`}>
                    <MenuItem
                      onClick={() => resendEmail(recipient.roleName)}
                      sx={{ borderRadius: 1, typography: 'body2' }}
                      disabled={isDisabled}
                    >
                      <Iconify
                        icon={
                          (urlLoading && currentRoleName === recipient?.roleName) ||
                          currentEmailSigner === recipient?.roleName
                            ? 'eva:clock-outline'
                            : 'eva:person-fill'
                        }
                        mr={2}
                        height={24}
                      />
                      <Typography variant="body2">{`Resend to ${recipientName}`}</Typography>
                    </MenuItem>
                  </Tooltip>
                  {/* <Divider key={idx + 'sign3'} sx={{ my: 0.5 }} /> */}
                </div>
              );
            }

            if (
              user?.role === roles.CLIENT &&
              isNextSigner &&
              [EnvelopeSigner.FIRST_INVESTOR, EnvelopeSigner.SECOND_INVESTOR].includes(
                recipient?.roleName as EnvelopeSigner
              )
            ) {
              return (
                <div key={idx + 'sign'}>
                  <Tooltip
                    key={idx + 'sign1'}
                    title={
                      isNextSigner
                        ? `${recipientName} can now sign this document. Click to initiate their in-person signing session.`
                        : `${recipientName} will be emailed this document for signing once previous signers have signed.`
                    }
                  >
                    <MenuItem
                      // @ts-ignore
                      onClick={() => handleSigning(recipient)}
                      sx={{ borderRadius: 1, typography: 'body2' }}
                      disabled={isDisabled}
                    >
                      <Iconify
                        icon={
                          (urlLoading && currentRoleName === recipient?.roleName) ||
                          currentEmailSigner === recipient?.roleName
                            ? 'eva:clock-outline'
                            : 'eva:person-fill'
                        }
                        mr={2}
                        height={24}
                      />

                      <Typography variant="body2">{`Sign now`}</Typography>
                    </MenuItem>
                  </Tooltip>
                  {/* <Tooltip key={idx + 'sign2'} title={`Resend to ${recipientName}`}>
                    <MenuItem
                      onClick={() => resendEmail(recipient.roleName)}
                      sx={{ borderRadius: 1, typography: 'body2' }}
                      disabled={isDisabled}
                    >
                      <Iconify
                        icon={
                          (urlLoading && currentRoleName === recipient?.roleName) ||
                          currentEmailSigner === recipient?.roleName
                            ? 'eva:clock-outline'
                            : 'eva:person-fill'
                        }
                        mr={2}
                        height={24}
                      />
                      <Typography variant="body2">{`Resend Email`}</Typography>
                    </MenuItem>
                  </Tooltip> */}
                  {/* <Divider key={idx + 'sign3'} sx={{ my: 0.5 }} /> */}
                </div>
              );
            }

            return null;
          })}

        <MenuItem
          onClick={() => handleDownloadDocument(envelope.id)}
          sx={{ borderRadius: 1, typography: 'body2' }}
          disabled={isLoading}
        >
          <Iconify icon={'eva:download-outline'} sx={{ mr: 2 }} />
          Download
        </MenuItem>

        {user?.role !== roles.CLIENT && (
          <MenuItem
            onClick={() => handleCompleteEnvelope(envelope.id)}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:checkmark-circle-outline'} sx={{ mr: 2 }} />
            Mark as complete
          </MenuItem>
        )}
        {user?.role !== roles.CLIENT && (
          <MenuItem
            onClick={() => setShowVoidReasonModal(true)}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:close-outline'} sx={{ mr: 2 }} />
            Cancel document
          </MenuItem>
        )}
      </CustomPopover>

      {showVoidReasonModal && (
        <CancelReasonModal
          open={showVoidReasonModal}
          onContinue={(voidReason: string) => handleCancelEnvelope(envelope.id, voidReason)}
          onCancel={() => setShowVoidReasonModal(false)}
        />
      )}
    </>
  );
}
