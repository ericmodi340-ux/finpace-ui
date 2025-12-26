import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { Tooltip, Typography } from '@mui/material';
import { EmailTemplate } from '../../../../@types/engagementHub';
import CustomPopover, { usePopover } from 'components/custom-popover';
import Label from 'components/Label';
import Iconify from 'components/Iconify';
import { useCallback, useEffect, useState } from 'react';
import { getStorageItem, storagePaths } from 'redux/slices/storage';
import { useSelector } from 'redux/store';
import { useBoolean } from 'hooks/useBoolean';
import EmailTemplateModal from './email-template-new-modal';
import ConfirmDialog from 'components/ConfirmDialog';
import { LoadingButton } from '@mui/lab';
import ShareWithAdvisorModal from './share-with-advisor-modal';

// ----------------------------------------------------------------------

type Props = {
  data: EmailTemplate;
  onSend: VoidFunction;
  onEdit: VoidFunction;
  onDelete: (data: EmailTemplate) => Promise<void>;
  onClone: (data: EmailTemplate) => Promise<void>;
};

export default function EmailTemplateCard({ data, onSend, onEdit, onDelete, onClone }: Props) {
  const popover = usePopover();
  const deleteDialog = useBoolean();

  const [cover, setCover] = useState('');
  const { user } = useSelector((state) => state.user);
  const openAutoDeliveryModal = useBoolean();
  const openShareWithAdvisorModal = useBoolean();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function getCover() {
      if (cover) return;
      getStorageItem({
        path: storagePaths.emailTemplateThumbnails(user?.id || '', data.emailTemplateId),
      }).then((res) => {
        setCover(res);
      });
    }
    getCover();
  }, [cover, data.emailTemplateId, user?.id]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await onDelete(data);
    setIsDeleting(false);
    popover.onClose();
  }, [data, onDelete, popover]);

  const handleClone = useCallback(async () => {
    if (!onClone) return;
    setIsLoading(true);
    await onClone(data);
    setIsLoading(false);
    popover.onClose();
  }, [data, onClone, popover]);

  return (
    <>
      <Card>
        <Stack
          spacing={0.5}
          direction="row"
          sx={{
            p: (theme) => theme.spacing(1, 1, 0, 1),
          }}
        >
          <Stack flexGrow={1} sx={{ position: 'relative' }}>
            <Box
              component="img"
              alt={data.name}
              src={cover}
              sx={{
                borderRadius: 1,
                height: 180,
                width: 1,
                objectFit: 'cover',
                objectPosition: 'top',
              }}
            />
            <Label
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
              }}
              color="info"
            >
              {data.isActive ? 'Active' : 'Inactive'}
            </Label>
          </Stack>
        </Stack>

        <Stack
          spacing={1.5}
          direction="row"
          sx={{
            position: 'relative',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: (theme) => theme.spacing(2.5),
            py: (theme) => theme.spacing(1.5),
          }}
        >
          <Stack>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              {data.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Auto Delivery:
              <Label variant="outlined" sx={{ ml: 1 }}>
                {data.emailType && data.emailType !== 'none' ? 'Enabled' : 'Disabled'}
              </Label>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title="Send Manually" placement="top">
              <span>
                <IconButton onClick={onSend}>
                  <Iconify icon="mdi:email-send" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Settings" placement="top">
              <span>
                <IconButton onClick={popover.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      <ConfirmDialog
        title="Delete Template"
        open={deleteDialog.value}
        content="Are you sure you want to delete this template?"
        onClose={deleteDialog.onFalse}
        action={
          <LoadingButton
            loading={isDeleting}
            variant="contained"
            onClick={handleDelete}
            sx={{ width: 150 }}
          >
            Delete Template
          </LoadingButton>
        }
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 250, py: 2 }}
      >
        <MenuItem
          onClick={() => {
            openAutoDeliveryModal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit Template Settings
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="mdi:design" />
          Edit Template Design
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            openShareWithAdvisorModal.onTrue();
          }}
        >
          <Iconify icon="ic:baseline-share" />
          Share with Advisor
        </MenuItem>

        <MenuItem onClick={handleClone}>
          <Iconify icon="mdi:content-copy" />
          {isLoading ? 'Cloning...' : ' Clone Template'}
        </MenuItem>

        <MenuItem
          disabled={data?.isSystemTemplate}
          onClick={deleteDialog.onTrue}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {isDeleting ? 'Deleting...' : 'Delete Template'}
        </MenuItem>
      </CustomPopover>
      <EmailTemplateModal
        fullWidth
        open={openAutoDeliveryModal.value}
        onClose={openAutoDeliveryModal.onFalse}
        maxWidth="xs"
        data={data}
      />
      <ShareWithAdvisorModal
        open={openShareWithAdvisorModal.value}
        onClose={openShareWithAdvisorModal.onFalse}
        maxWidth="sm"
        data={data}
      />
    </>
  );
}
