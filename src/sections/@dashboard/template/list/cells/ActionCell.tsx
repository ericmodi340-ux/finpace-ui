import { sentenceCase } from 'change-case';
import { useNavigate } from 'react-router';
// @mui
import { Box } from '@mui/material';
// @types
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { dispatch, useSelector } from 'redux/store';
import { getTemplates as getLibraryTemplates, importTemplate } from 'redux/slices/library';
// hooks
import useAuth from 'hooks/useAuth';
// components
// sections
// utils
// constants
// components
import Iconify from 'components/Iconify';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function ActionCell({ id }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuth();
  const libraryTemplates = useSelector((state) => state.libraryTemplates);

  useEffect(() => {
    dispatch(getLibraryTemplates());
  }, []);

  const handleClick = () => {
    addTemplate();
  };
  const addTemplate = async () => {
    try {
      if (isAuthenticated) {
        const response = await importTemplate(id);
        navigate(`${PATH_DASHBOARD.templates.root}/${response.id}`);
      }

      enqueueSnackbar('Library template saved!', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save progress', { variant: 'error' });
    }
  };

  return (
    <LoadingButton
      variant="outlined"
      onClick={handleClick}
      color="primary"
      loading={libraryTemplates.isLoading}
    >
      <Iconify icon={'eva:plus-circle-fill'} width={18} height={18} />

      <Box sx={{ ml: 1 }}>{sentenceCase('Add to my account')}</Box>
    </LoadingButton>
  );
}
