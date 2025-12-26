import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// @mui
import { Menu, MenuItem, IconButton } from '@mui/material';
// @types
import { FormManager, FormStatus } from '../../../../@types/form';
// redux
import { getForm, updateForm } from 'redux/slices/forms';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Iconify from 'components/Iconify';
import { formStatuses } from 'constants/forms';
// sections
import CancelReasonModal from './CancelReasonModal';
import { getTemplate } from 'redux/slices/templates';
import { useSelector } from 'redux/store';
import { fDate } from 'utils/formatTime';
import { getStorageBlob, storagePaths } from 'redux/slices/storage';
import { blobToBase64 } from 'utils/files';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
  isLoading: boolean;
  onFormCancel: any;
};

export default function FormMoreMenu({ form, isLoading, onFormCancel }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { byId: advisorsById } = useSelector((state) => state.advisors);
  const { byId: clientsById } = useSelector((state) => state.clients);
  const { firm } = useSelector((state) => state.firm);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);

  const handleCancelForm = async (formId: string, cancelReason: string) => {
    setShowCancelReasonModal(false);
    setIsOpen(false);

    try {
      const newForm = {
        status: formStatuses.CANCELLED as FormStatus.CANCELLED,
        cancelReason,
        dateCancelled: new Date(),
      };
      await updateForm(formId, newForm);
      enqueueSnackbar('Form cancelled', { variant: 'success' });
      onFormCancel((prevForms: any) => {
        const selectedForm = {
          ...prevForms.find((form: any) => form.id === formId),
          status: formStatuses.CANCELLED,
        };
        const restForms = prevForms.filter((form: any) => form.id !== formId);

        return [...restForms, selectedForm];
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  if ([formStatuses.CANCELLED].includes(form.status)) {
    return <></>;
  }

  const handleDownload = async () => {
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
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { px: 1, width: 200, color: 'text.secondary' },
        }}
      >
        <MenuItem
          component={RouterLink}
          to={`${PATH_DASHBOARD.forms.root}/${form.id}${
            form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED
              ? '/view'
              : ''
          }`}
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

        {(form.status === formStatuses.COMPLETED || form.status === formStatuses.CANCELLED) && (
          <MenuItem
            onClick={handleDownload}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:download-fill'} sx={{ mr: 2, width: 24, height: 24 }} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </MenuItem>
        )}

        {form.status !== formStatuses.COMPLETED && (
          <MenuItem
            onClick={() => setShowCancelReasonModal(true)}
            sx={{ borderRadius: 1, typography: 'body2' }}
            disabled={isLoading}
          >
            <Iconify icon={'eva:close-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Cancel form
          </MenuItem>
        )}
      </Menu>
      <CancelReasonModal
        open={showCancelReasonModal}
        onContinue={(cancelReason: string) => handleCancelForm(form.id, cancelReason)}
        onCancel={() => {
          setShowCancelReasonModal(false);
          setIsOpen(false);
        }}
      />
    </>
  );
}
