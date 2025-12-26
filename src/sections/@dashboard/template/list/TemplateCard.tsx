import { Dispatch, SetStateAction, useState } from 'react';
// @mui
import { Box, Card, Typography, Stack, Tooltip, Link, Button } from '@mui/material';
// components
import Image from '../../../../components/Image';
import Iconify from 'components/Iconify';
// redux
import { importTemplate } from 'redux/slices/library';
// hooks
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
import TemplateInfoModal from './TemplateInfoModal';
import { IconButtonAnimate } from 'components/animate';
import { LoadingButton } from '@mui/lab';

type templateCardProps = {
  template: {
    id: string;
    title: string;
    description: string;
    image: string;
  };
  onClickName: (id: string) => void;
};

export default function TemplateCard({ template, onClickName }: templateCardProps) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    await addTemplate();
    setLoading(false);
  };

  const addTemplate = async (): Promise<void> => {
    try {
      if (isAuthenticated) {
        const response = await importTemplate(template.id);
        navigate(`${PATH_DASHBOARD.templates.root}/${response.id}`);
      }
      enqueueSnackbar(`${template?.title} template saved to your account!`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save progress', { variant: 'error' });
    }
  };

  const handleOnNameClick = (): void => {
    onClickName(template.id);
  };

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', paddingX: 2, paddingY: 4 }}>
        <Stack spacing={1} sx={{ flexDirection: 'column', textAlign: 'center' }}>
          <Link
            component="button"
            noWrap
            color="inherit"
            variant="subtitle2"
            onClick={handleOnNameClick}
          >
            <Typography variant="h5" noWrap>
              {template?.title}
            </Typography>
          </Link>
          <Typography
            sx={{
              pb: 3,
            }}
            variant="body2"
          >
            {template?.description}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ width: '100%', mt: 'auto' }}
        >
          <Button onClick={handleOnNameClick} variant="outlined">
            View Form
          </Button>
          <LoadingButton loading={loading} onClick={handleClick} variant="contained">
            Add To My Templates
          </LoadingButton>
        </Stack>
      </Card>
      {isOpen && (
        <TemplateInfoModal
          template={template}
          isOpen={isOpen}
          handleClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
