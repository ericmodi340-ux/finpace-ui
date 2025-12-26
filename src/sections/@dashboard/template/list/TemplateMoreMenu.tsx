import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// @mui
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// redux
import { createTemplate, getTemplate, updateTemplate } from 'redux/slices/templates';
import useTemplate from 'hooks/useTemplate';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

type Props = {
  onDelete?: VoidFunction;
  templateId: string;
};

export default function TemplateMoreMenu({ onDelete, templateId }: Props) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const template = useTemplate(templateId);

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    if (onDelete) {
      await onDelete();
    }
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  };

  const handleMakeTemplateInactive = async () => {
    if (templateId) {
      try {
        setIsLoading(true);
        await updateTemplate(templateId, { inactive: true });
        setDeleteConfirmOpen(false);
        enqueueSnackbar('Update success', { variant: 'success' });
      } catch (e) {
        console.log(e);
        enqueueSnackbar('Oops, an error occured!', { variant: 'error' });
      }
      setIsLoading(false);
    }
  };

  const handleCloneTemplate = async () => {
    setIsLoading(true);
    try {
      const template = await getTemplate(templateId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...cloneTemplate } = template;
      const response = await createTemplate({
        ...cloneTemplate,
        title: template.title + ' Copy',
      });
      if (response?.id) {
        navigate(`${PATH_DASHBOARD.templates.root}/${response.id}`);
      } else {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
      setIsLoading(false);
    }
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
          to={`${PATH_DASHBOARD.templates.root}/${templateId}`}
          sx={{ borderRadius: 1, typography: 'body2' }}
        >
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2, width: 24, height: 24 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleCloneTemplate} sx={{ borderRadius: 1, typography: 'body2' }}>
          <Iconify icon={'eva:copy-fill'} sx={{ mr: 2, width: 24, height: 24 }} />
          Clone
        </MenuItem>
        {onDelete && (
          <MenuItem onClick={handleOpenDeleteConfirm} sx={{ borderRadius: 1, typography: 'body2' }}>
            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {onDelete && (
        <Dialog open={deleteConfirmOpen} maxWidth="xs">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>This will permanently delete the template.</strong> This template will no
              longer be usable by clients or advisors.
              <br />
              <br />
              If you'd like to temporarily deactivate the template, click "Make template inactive"
              below.
              <br />
              <br />
              If you'd like to hide this template from the template list, click "Cancel" below and
              toggle it as Inactive on its edit page.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={isLoading}
              onClick={handleCloseDeleteConfirm}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Tooltip title={template?.inactive ? 'This template is already inactive' : ''}>
              <div>
                <LoadingButton
                  color="error"
                  variant="outlined"
                  disabled={template?.inactive}
                  loading={isLoading}
                  onClick={handleMakeTemplateInactive}
                  sx={{ textTransform: 'none' }}
                >
                  Make template inactive
                </LoadingButton>
              </div>
            </Tooltip>
            <LoadingButton
              color="error"
              variant="contained"
              disabled={isLoading}
              loading={isLoading}
              onClick={handleDelete}
              sx={{ textTransform: 'none' }}
            >
              Yes, delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
