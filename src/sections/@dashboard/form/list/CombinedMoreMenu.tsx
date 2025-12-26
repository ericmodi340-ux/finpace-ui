import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// @mui
import { MenuItem, IconButton, Typography, Tooltip } from '@mui/material';
// @types
import { FormManager, FormStatus } from '../../../../@types/form';
import { EnvelopeSigner, EnvelopeStatus } from '../../../../@types/envelope';
// redux
import { getForm, updateForm } from 'redux/slices/forms';
import { getDocumentS3Url, resendSigningEmail, updateEnvelope } from 'redux/slices/envelopes';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Iconify from 'components/Iconify';
import { formStatuses } from 'constants/forms';
import {
  envelopeRecipientStatuses,
  envelopeRecipients,
  envelopeStatuses,
} from 'constants/envelopes';
// sections
import CancelReasonModal from './CancelReasonModal';
import { getTemplate } from 'redux/slices/templates';
import { useSelector } from 'redux/store';
import { fDate } from 'utils/formatTime';
import { getStorageBlob, storagePaths } from 'redux/slices/storage';
import { blobToBase64 } from 'utils/files';
import axios from 'axios';
import useTemplate from 'hooks/useTemplate';
import { getTemplateName } from 'utils/templates';
import { sortEnvelopeRecipients } from 'utils/envelopes';
import { roles } from 'constants/users';
import useAuth from 'hooks/useAuth';
import useSigningWindow from 'hooks/useSigningWindow';
import CustomPopover, { usePopover } from 'components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
  isLoading: boolean;
  onFormCancel?: any;
};

export default function CombinedMoreMenu({ form, isLoading, onFormCancel }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const popover = usePopover();
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [currentEmailSigner, setCurrentEmailSigner] = useState<string | undefined>(undefined);

  const { byId: advisorsById } = useSelector((state) => state.advisors);
  const { byId: clientsById } = useSelector((state) => state.clients);
  const { firm } = useSelector((state) => state.firm);
  const { user } = useAuth();

  const template = useTemplate(form?.templateId);
  const templateName = getTemplateName(template);

  const { envelope } = form;
  const { urlLoading, currentRoleName, openSigningWindow } = useSigningWindow(envelope);

  const handleCancelForm = async (formId: string, cancelReason: string) => {
    setShowCancelReasonModal(false);
    popover.onClose();

    try {
      const newForm = {
        status: formStatuses.CANCELLED as FormStatus.CANCELLED,
        cancelReason,
        dateCancelled: new Date(),
      };

      await updateForm(formId, newForm);
      enqueueSnackbar('Form cancelled', { variant: 'success' });
      if (onFormCancel) {
        onFormCancel((prevForms: any) => {
          const selectedForm = {
            ...prevForms.find((form: any) => form.id === formId),
            status: formStatuses.CANCELLED,
          };
          const restForms = prevForms.filter((form: any) => form.id !== formId);
          return [...restForms, selectedForm];
        });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleCancelEnvelope = async (envelopeId: string, voidReason: string) => {
    try {
      const newEnvelope = {
        status: envelopeStatuses.CANCELLED as EnvelopeStatus.CANCELLED,
        voidReason,
      };
      await updateEnvelope(envelopeId, newEnvelope);
      enqueueSnackbar('Document cancelled', { variant: 'success' });
      setShowCancelReasonModal(false);
      popover.onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleCompleteEnvelope = async (envelopeId: string) => {
    try {
      const newEnvelope = {
        status: envelopeStatuses.COMPLETED as EnvelopeStatus.COMPLETED,
      };
      await updateEnvelope(envelopeId, newEnvelope);
      enqueueSnackbar('Document completed!', { variant: 'success' });
      popover.onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleDownloadForm = async () => {
    setIsDownloading(true);
    const { exportToPdf } = await import('utils/formio-to-pdf');
    const advisorIconPath = storagePaths.advisorIcon(firm.id, form?.advisorId);
    const advisorLogo = await getStorageBlob({
      path: advisorIconPath,
    });

    let logoBase64: string = '';
    if (advisorLogo) {
      logoBase64 = (await blobToBase64(advisorLogo)) as string;
    }

    if (!advisorLogo) {
      const firmLogoPath = storagePaths.firmIcon(firm.id);
      const firmLogo = await getStorageBlob({
        path: firmLogoPath,
      });
      if (firmLogo) {
        logoBase64 = (await blobToBase64(firmLogo)) as string;
      }
    }

    const template = await getTemplate(form?.templateId);
    const fullForm = await getForm(form?.id);

    exportToPdf(template.fields, fullForm?.submission[`${form?.templateId}::0`], {
      title: template?.title || '',
      advisorName: advisorsById[fullForm?.advisorId]?.name || '',
      firmName: firm?.name || '',
      clientName: clientsById[fullForm?.clientId]?.name || '',
      createdAt: fDate(new Date(), 'MM/dd/yyyy'),
      firmLogoBase64: logoBase64 || '',
    });
    setIsDownloading(false);
    popover.onClose();
  };

  const handleDownloadEnvelope = async (envelopeId: string) => {
    try {
      const getS3Url = await getDocumentS3Url(envelopeId, 'combined');
      const s3Url = getS3Url.url;

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

  const resendEmail = async (roleName: string | undefined) => {
    if (!envelope) return;

    setLoading(true);
    try {
      setCurrentEmailSigner(roleName);
      roleName && (await resendSigningEmail(envelope.id, roleName));
      enqueueSnackbar('Signing email resent!', { variant: 'success' });
      setCurrentEmailSigner('');
      setLoading(false);
      popover.onClose();
    } catch (err) {
      setLoading(false);
      popover.onClose();
    }
  };

  const handleSigning = async (recipient: any) => {
    if (!envelope) return;

    const { roleName, recipientId } = recipient;
    const { signingEventType = 'docusign' } = envelope;

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

  // Don't show menu for cancelled forms without envelope
  if ([formStatuses.CANCELLED].includes(form.status) && !envelope) {
    return <></>;
  }

  const getCurrentSignerIndex = (recipients: any): number =>
    recipients.findIndex((recipient: any) => recipient.status === formStatuses.SENT);

  const getFormViewLink = () => {
    const isReadonly =
      form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED;
    return `${PATH_DASHBOARD.forms.root}/${form.id}${isReadonly ? '/view' : ''}`;
  };

  return (
    <>
      <IconButton onClick={popover.onOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { px: 1, width: 200, color: 'text.secondary' },
        }}
      >
        {/* Form View/Edit */}
        <MenuItem
          component={RouterLink}
          to={getFormViewLink()}
          sx={{ borderRadius: 1, typography: 'body2' }}
          disabled={isLoading}
        >
          <Iconify
            icon={
              form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED
                ? 'eva:eye-fill'
                : 'eva:edit-fill'
            }
            sx={{ mr: 2, width: 24, height: 24 }}
          />
          {form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED
            ? 'View'
            : 'Continue'}{' '}
          form
        </MenuItem>

        {/* Download Form */}
        {(form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED) && (
          <MenuItem
            onClick={handleDownloadForm}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:download-fill'} sx={{ mr: 2, width: 24, height: 24 }} />
            {isDownloading ? 'Downloading...' : 'Download'} form
          </MenuItem>
        )}

        {/* Envelope Actions */}
        {envelope && (
          <>
            {/* Download Envelope */}
            <MenuItem
              onClick={() => handleDownloadEnvelope(envelope.id)}
              sx={{ borderRadius: 1, typography: 'body2' }}
              disabled={isLoading}
            >
              <Iconify icon={'eva:download-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
              Download envelope
            </MenuItem>

            {/* Signing Actions */}
            {envelope.status === envelopeStatuses.SENT && (
              <>
                {sortEnvelopeRecipients(envelope.recipients)
                  .filter((recipient) => recipient.role !== 'cc')
                  .map((recipient, idx) => {
                    const sortedRecipients = sortEnvelopeRecipients(envelope.recipients);
                    const currentSignerIndex = getCurrentSignerIndex(sortedRecipients);
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
                          <MenuItem
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
                              sx={{ mr: 2, width: 24, height: 24 }}
                            />
                            <Typography variant="body2">{`${recipientName} Signed`}</Typography>
                          </MenuItem>
                        </Tooltip>
                      );
                    }

                    if (recipient?.roleName === envelopeRecipients.FIRM) {
                      // Hide resend button for clients
                      if (user?.role === roles.CLIENT) {
                        return null;
                      }

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
                              sx={{ mr: 2, width: 24, height: 24 }}
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
                                sx={{ mr: 2, width: 24, height: 24 }}
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
                                sx={{ mr: 2, width: 24, height: 24 }}
                              />
                              <Typography variant="body2">{`Resend to ${recipientName}`}</Typography>
                            </MenuItem>
                          </Tooltip>
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
                                sx={{ mr: 2, width: 24, height: 24 }}
                              />
                              <Typography variant="body2">{`Sign now`}</Typography>
                            </MenuItem>
                          </Tooltip>
                        </div>
                      );
                    }

                    return null;
                  })}

                {/* Mark as complete */}
                {user?.role !== roles.CLIENT && (
                  <MenuItem
                    onClick={() => handleCompleteEnvelope(envelope.id)}
                    sx={{ borderRadius: 1, typography: 'body2' }}
                    disabled={isLoading}
                  >
                    <Iconify
                      icon={'eva:checkmark-circle-outline'}
                      sx={{ mr: 2, width: 24, height: 24 }}
                    />
                    Mark as complete
                  </MenuItem>
                )}
              </>
            )}
          </>
        )}

        {/* Cancel Actions */}
        {form.status !== formStatuses.COMPLETED && user?.role !== roles.CLIENT && (
          <MenuItem
            onClick={() => setShowCancelReasonModal(true)}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:close-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Cancel {envelope ? 'document' : 'form'}
          </MenuItem>
        )}
      </CustomPopover>

      <CancelReasonModal
        open={showCancelReasonModal}
        onContinue={(reason: string) => {
          if (envelope && envelope.status === envelopeStatuses.SENT) {
            handleCancelEnvelope(envelope.id, reason);
          } else {
            handleCancelForm(form.id, reason);
          }
        }}
        onCancel={() => {
          setShowCancelReasonModal(false);
          popover.onClose();
        }}
      />
    </>
  );
}
