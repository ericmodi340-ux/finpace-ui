import { useState } from 'react';
import { useParams } from 'react-router';
import { capitalCase } from 'change-case';
import { useSnackbar } from 'notistack';
// @mui
import {
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
// @types
import { TemplateWithFieldsManager } from '../../../../@types/template';
// redux
import { updateTemplate } from 'redux/slices/templates';
// hooks
import useParamTabs from 'hooks/useParamTabs';
// components
import Iconify from 'components/Iconify';
// sections
import { GeneralInfo, Document } from './tabs';
import { useSelector } from 'redux/store';

export default function TemplateEdit({
  showRTE,
  setShowRTE,
  downloadTemplate,
  previewTemplate,
}: {
  showRTE: boolean;
  setShowRTE: (value: boolean) => void;
  downloadTemplate?: () => void;
  previewTemplate?: () => void;
}) {
  const { templateId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { fullTemplate: template } = useSelector((state) => state.templates);
  const { currentTab, setCurrentTab } = useParamTabs('general');
  const [formUpdates, setFormUpdates] = useState<Partial<TemplateWithFieldsManager> | null>(null);
  const [confirmUpdates, setConfirmUpdates] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [tempTab, setTempTab] = useState('');
  const [isSaved, setSave] = useState(false);

  let TABS = [
    {
      value: 'general',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: (
        <GeneralInfo
          template={template as any}
          onFormUpdate={(data: any) => {
            setFormUpdates(data);
          }}
          setFormUpdates={setFormUpdates}
          formUpdates={formUpdates}
          setSave={setSave}
        />
      ),
    },
  ];

  if (template?.signingEvent) {
    TABS.push({
      value: 'document',
      icon: <Iconify icon={'ic:round-insert-drive-file'} width={20} height={20} />,
      component: (
        <Document template={template} showRTE={showRTE} setShowRTE={setShowRTE} setSave={setSave} />
      ),
    });
  }

  const handleTabChange = (newTab: string) => {
    if (formUpdates && templateId && !isSaved) {
      setConfirmUpdates(true);
      setTempTab(newTab);
    } else {
      setCurrentTab(newTab);
    }
  };

  const onClose = () => {
    setConfirmUpdates(false);
    setFormUpdates(null);
    setCurrentTab(tempTab);
    setTempTab('');
  };

  const onYes = () => {
    if (formUpdates && templateId) {
      setSubmitting(true);

      updateTemplate(templateId, formUpdates)
        .then(() => {
          setConfirmUpdates(false);
          setFormUpdates(null);
          setCurrentTab(tempTab);
          setSubmitting(false);
          setTempTab('');
          enqueueSnackbar('Update success', { variant: 'success' });

          setCurrentTab(tempTab);
        })
        .catch((e) => {
          enqueueSnackbar('Oops, an error occured!', { variant: 'error' });
          setConfirmUpdates(false);
          setFormUpdates(null);
          setSubmitting(false);
          setTempTab('');
        });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(e, value) => handleTabChange(value)}
          sx={{ flex: 1 }}
        >
          {TABS.map((tab) => (
            <Tab
              disableRipple
              key={tab.value}
              label={capitalCase(tab.value)}
              icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', gap: 2, ml: 3 }}>
          {downloadTemplate && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon={'eva:download-fill'} />}
              onClick={downloadTemplate}
              size="small"
            >
              Download
            </Button>
          )}
          {previewTemplate && !template?.surveyJsEnabled && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon={'eva:eye-fill'} />}
              onClick={previewTemplate}
              size="small"
            >
              Preview
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }} />

      {TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}

      <Dialog
        open={confirmUpdates}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to save your changes on this tab?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            No
          </Button>
          <Button variant="contained" onClick={onYes} autoFocus disabled={isSubmitting}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
