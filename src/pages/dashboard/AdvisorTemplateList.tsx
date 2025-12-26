import { useEffect, useState } from 'react';
import { useSelector, dispatch } from 'redux/store';
import { isEmpty, toArray } from 'lodash';
import {
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Container,
  Card,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import Iconify from 'components/Iconify';
import Page from 'components/Page';
import useSettings from 'hooks/useSettings';
import useUser from 'hooks/useUser';
import useCopyToClipboard from 'hooks/useCopyToClipboard';
import { useSnackbar } from 'notistack';
import { getTemplates } from 'redux/slices/templates';
import { TemplateManager } from '../../@types/template';
import { AdvisorManager } from '../../@types/advisor';

const AdvisorTemplateList = () => {
  const { themeStretch } = useSettings();
  const { byId } = useSelector((state) => state.templates);
  const { firm } = useSelector((state) => state.firm);
  const { user } = useUser();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const advisor = user as AdvisorManager;

  const [value, setValue] = useState<TemplateManager | null>(null);
  const [publicUrl, setPublicUrl] = useState('');

  const templatesArray = toArray(byId);

  const updateTemplateId = (_: any, newValue: TemplateManager | null) => {
    if (!newValue) return;
    setValue(newValue);
    setPublicUrl(
      `${window.location.origin}/public/forms/new?firmId=${firm?.id}&templateId=${newValue.id}&advisorId=${advisor?.id}`
    );
  };

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar('Public Form URL Copied', { variant: 'success' });
      copy(text);
    }
  };

  useEffect(() => {
    if (isEmpty(byId)) dispatch(getTemplates());
  }, [byId]);

  return (
    <>
      <Page title={'Template'}>
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <Card>
            <CardContent>
              <Stack direction="column" justifyContent="center" alignItems="left" spacing={2}>
                <InputLabel id="new-template-id">
                  Select a Template to Generate Public URL
                </InputLabel>
                <Autocomplete
                  id="template-id"
                  sx={{ width: '100%' }}
                  getOptionLabel={(template) => template.title || 'Your Template'}
                  value={value}
                  onChange={updateTemplateId}
                  options={templatesArray}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Template" variant="outlined" fullWidth />
                  )}
                />
                <InputLabel htmlFor="routing">
                  Public URL to collect responses from Client
                </InputLabel>
                <TextField
                  fullWidth
                  disabled
                  value={publicUrl || ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={'Copy'}>
                          <IconButton onClick={() => onCopy(publicUrl)}>
                            <Iconify icon="eva:copy-fill" width={24} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Page>
    </>
  );
};

export default AdvisorTemplateList;
