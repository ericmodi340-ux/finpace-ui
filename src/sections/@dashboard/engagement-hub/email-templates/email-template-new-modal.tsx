import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { EmailTemplate } from '../../../../@types/engagementHub';
import { RHFSelect, RHFSwitch, RHFTextField } from 'components/hook-form';
import FormProvider from 'components/hook-form/FormProvider';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { createEmailTemplate, updateEmailTemplate } from 'redux/slices/engagement-hub';
import { useSelector } from 'redux/store';
import { PATH_DASHBOARD } from 'routes/paths';
import * as Yup from 'yup';
import MultiUpload from './multi-upload';
import { storagePaths } from 'redux/slices/storage';

type Props = DialogProps & {
  data?: EmailTemplate;
  onClose: () => void;
};

export default function EmailTemplateModal(props: Props) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const Schema = Yup.object().shape({
    name: Yup.string().required('Template Name is required'),
    subject: Yup.string(),
    isActive: Yup.boolean().required('Template Status is required'),
    emailType: Yup.string().required('This field is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: props?.data?.name || '',
      subject: props?.data?.subject || '',
      isActive: props?.data?.isActive ?? true,
      emailType: props?.data?.emailType || 'none',
    }),
    [props.data]
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const { handleSubmit, watch } = methods;
  const onSubmit = handleSubmit(async (data) => {
    if (!user?.id) return;
    setLoading(true);
    let resp: EmailTemplate;
    if (!props.data) {
      resp = await createEmailTemplate(user?.id, {
        name: data.name,
        isActive: data.isActive,
        emailType: data.emailType,
        subject: data.subject,
      });
    } else {
      resp = await updateEmailTemplate(user?.id, props.data.emailTemplateId, {
        name: data.name,
        isActive: data.isActive,
        emailType: data.emailType,
        subject: data.subject,
      });
    }
    setLoading(false);
    props.onClose();
    if (resp?.emailTemplateId && !props.data) {
      navigate(PATH_DASHBOARD.engagementHub.emailTemplateEdit(resp?.emailTemplateId));
    }
  });

  return (
    <Dialog {...props} fullWidth maxWidth="sm" onClose={props.onClose}>
      <DialogTitle>{props.data ? 'Edit Email Template' : 'Create New Email Template'}</DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <RHFTextField
              name="name"
              label="Template Name"
              placeholder="Template Name"
              variant="outlined"
              fullWidth
              required
            />
            <RHFTextField
              name="subject"
              label="Subject Line"
              placeholder="Your Subject Line"
              variant="outlined"
              fullWidth
              required
            />
            <RHFSelect disabled name="emailType" label="Trigger Email Type">
              <MenuItem value="none">
                <ListItemText primary="None" />
              </MenuItem>
              <MenuItem value="notification-email">
                <ListItemText primary="notification-email" />
              </MenuItem>
              <MenuItem value="invite-email">
                <ListItemText primary="invite-email" />
              </MenuItem>
              <MenuItem value="advisor-invite-email">
                <ListItemText primary="advisor-invite-email" />
              </MenuItem>
              <MenuItem value="disclosure-email">
                <ListItemText primary="disclosure-email" />
              </MenuItem>
              <MenuItem value="envelope-completed-email">
                <ListItemText primary="envelope-completed-email" />
              </MenuItem>
            </RHFSelect>
            <RHFSwitch name="isActive" label={watch('isActive') ? 'Active' : 'Inactive'} />
            {props.data?.emailTemplateId && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Attachments</Typography>
                <MultiUpload
                  path={storagePaths.emailTemplateAttachments(
                    user?.id || '',
                    props.data?.emailTemplateId
                  )}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancel</Button>
          <LoadingButton
            sx={{ width: 120 }}
            loading={loading}
            variant="contained"
            onClick={onSubmit}
          >
            {props.data ? 'Save' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
