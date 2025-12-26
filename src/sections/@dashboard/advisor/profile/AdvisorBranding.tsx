import { Card, Stack, Typography, Grid } from '@mui/material';
import { AdvisorManager } from '../../../../@types/advisor';
import Tip from 'components/Tip';
import { UploadSingleFile } from 'components/upload';
import { ICON_MAX_SIZE, LOGO_MAX_SIZE } from 'config';
import { useCallback, useEffect, useState } from 'react';
import { fData } from 'utils/formatNumber';
import {
  createStorageItem,
  deleteStorageItem,
  getStorageItem,
  storagePaths,
} from 'redux/slices/storage';

import { useSnackbar } from 'notistack';

type AdvisorGeneralProps = {
  isEdit: boolean;
  currentAdvisor?: AdvisorManager;
  advisorId: string;
};

export default function AdvisorBranding({ currentAdvisor }: AdvisorGeneralProps) {
  // const { url: logoUrl } = useStorage({ path: storagePaths.advisorLogo(currentAdvisor?.firmId || '', currentAdvisor?.id || '') });
  // const { url: iconUrl } = useStorage({ path: storagePaths.advisorIcon(currentAdvisor?.firmId || '', currentAdvisor?.id || '') });
  const { enqueueSnackbar } = useSnackbar();

  const [logoUrl, setLogoUrl] = useState<any>(null);
  const [iconUrl, setIconUrl] = useState<any>(null);

  const getLogo = useCallback(async (firmId: string, advisorId: string) => {
    try {
      const response = await getStorageItem({
        path: storagePaths.advisorLogo(firmId, advisorId),
      });
      setLogoUrl(response);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const getIcon = useCallback(async (firmId: string, advisorId: string) => {
    try {
      const response = await getStorageItem({
        path: storagePaths.advisorIcon(firmId, advisorId),
      });
      setIconUrl(response);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const handleDropLogo = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setLogoUrl(newFile);
        await createStorageItem({
          path: storagePaths.advisorLogo(currentAdvisor?.firmId || '', currentAdvisor?.id || ''),
          file,
        });
      }
    },
    [currentAdvisor?.firmId, currentAdvisor?.id]
  );

  const handleDropIcon = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setIconUrl(newFile);
        await createStorageItem({
          path: storagePaths.advisorIcon(currentAdvisor?.firmId || '', currentAdvisor?.id || ''),
          file,
        });
      }
    },
    [currentAdvisor?.firmId, currentAdvisor?.id]
  );

  const handleDelete = async (isLogo: boolean) => {
    try {
      const path = isLogo
        ? storagePaths.advisorLogo(currentAdvisor?.firmId || '', currentAdvisor?.id || '')
        : storagePaths.advisorIcon(currentAdvisor?.firmId || '', currentAdvisor?.id || '');
      await deleteStorageItem({ path });
      if (isLogo) {
        setLogoUrl(null);
      } else {
        setIconUrl(null);
      }
      enqueueSnackbar(`Deleted successfully`, { variant: 'success' });
    } catch (err) {
      console.error(`Error deleting`, err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (currentAdvisor?.firmId && currentAdvisor?.id) {
      getLogo(currentAdvisor?.firmId, currentAdvisor?.id);
      getIcon(currentAdvisor?.firmId, currentAdvisor?.id);
    }
  }, [currentAdvisor?.firmId, currentAdvisor?.id, getIcon, getLogo]);

  return (
    <Grid container spacing={5}>
      <Grid item xs={12} md={6}>
        <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
          <Typography variant="overline" sx={{ mb: 3, color: 'text.secondary' }}>
            Logo
          </Typography>
          <Tip
            title={
              <>
                <Typography color="inherit">Where does this show?</Typography>
                Your uploaded logo will appear:
                <ul style={{ listStyle: 'disc', marginLeft: 8, paddingLeft: 16 }}>
                  <li>on branded login pages</li>
                </ul>
              </>
            }
            sx={{ ml: 1, mt: '-1px', p: 0, '& svg': { width: 16, height: 16 } }}
          />
          <Stack spacing={2} sx={{ mt: 1, width: 1, textAlign: 'center' }}>
            <UploadSingleFile
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
              file={logoUrl}
              maxSize={LOGO_MAX_SIZE}
              onDrop={(files) => handleDropLogo(files)}
              onDelete={() => handleDelete(true)}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                mx: 'auto',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              Allowed *.jpeg, *.jpg, *.png, *.gif
              <br /> max size of {fData(LOGO_MAX_SIZE)}
            </Typography>
          </Stack>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
          <Typography variant="overline" sx={{ mb: 3, color: 'text.secondary' }}>
            Icon
          </Typography>
          <Tip
            title={
              <>
                <Typography color="inherit">Where does this show?</Typography>
                Your uploaded icon will appear:
                <ul style={{ listStyle: 'disc', marginLeft: 8, paddingLeft: 16 }}>
                  <li>on your dashboard as the icon in the upper left corner</li>
                  <li>on other firm admins dashboards as the icon in the upper left corner</li>
                  <li>on advisor dashboards as the icon in the upper left corner</li>
                  <li>on client/prospect dashboards as the icon in the upper left corner</li>
                  <li>in the "Your Firm" section of client/prospect client dashboards</li>
                </ul>
              </>
            }
            sx={{ ml: 1, mt: '-1px', p: 0, '& svg': { width: 16, height: 16 } }}
          />
          <Stack spacing={2} sx={{ mt: 1, width: 1, textAlign: 'center' }}>
            <UploadSingleFile
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
              file={iconUrl}
              maxSize={ICON_MAX_SIZE}
              onDrop={(files) => handleDropIcon(files)}
              onDelete={() => handleDelete(false)}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                mx: 'auto',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              Allowed *.jpeg, *.jpg, *.png, *.gif
              <br /> max size of {fData(ICON_MAX_SIZE)}
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
