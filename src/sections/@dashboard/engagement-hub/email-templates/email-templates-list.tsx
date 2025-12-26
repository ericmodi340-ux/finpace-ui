// @mui
import { Card, Stack, Skeleton, Box, Tabs, Tab, Typography } from '@mui/material';
// routes
import { useDispatch, useSelector } from 'redux/store';
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplate,
  getEmailTemplates,
} from 'redux/slices/engagement-hub';
import { EmailTemplate, EmailTemplateWithAllFields } from '../../../../@types/engagementHub';
import EmailTemplateCard from './email-template-card';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import RecipientsSelectDialog from './recipients-select';
import mjml from 'mjml-browser';
import { EditorCore } from '';
import { htmlToThumbnail } from 'utils/htmlToImage';
import { createStorageItem, storagePaths } from 'redux/slices/storage';

// ----------------------------------------------------------------------
function TemplateCardSkeleton() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', paddingX: 2, paddingY: 4 }}>
      <Stack spacing={1} mb={4}>
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Skeleton variant="rectangular" sx={{ width: 0.5, textAlign: 'center', mx: 'auto' }} />
        </Stack>
        <Skeleton variant="text" sx={{ width: 1, textAlign: 'center' }} />
        <Skeleton variant="text" sx={{ width: 1, textAlign: 'center' }} />
      </Stack>
      <Stack mt="auto" direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Skeleton variant="rectangular" sx={{ width: 80, height: 35 }} />
        <Skeleton variant="rectangular" sx={{ width: 120, height: 35 }} />
      </Stack>
    </Card>
  );
}

export default function EmailTemplatesList() {
  const { user } = useSelector((state) => state.user);
  const { emailTemplates, loaded, isLoading } = useSelector((state) => state.engagementHub);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('system'); // Default to system templates tab

  const onDelete = useCallback(
    async (emailTemplateId: string) => {
      if (!user?.id) return;
      await deleteEmailTemplate(user?.id, emailTemplateId);
    },
    [user?.id]
  );

  const onSend = useCallback(
    (emailTemplateId: string) => {
      navigate(PATH_DASHBOARD.engagementHub.emailTemplateSend + '?selectedId=' + emailTemplateId);
      // setSelectedTemplateId(emailTemplateId);
    },
    [navigate]
  );

  const onEdit = useCallback(
    (emailTemplateId: string) => {
      navigate(PATH_DASHBOARD.engagementHub.emailTemplateEdit(emailTemplateId));
    },
    [navigate]
  );

  const onClone = useCallback(
    async (data: EmailTemplate) => {
      if (!user?.id) return;
      const fullTemplate = await getEmailTemplate(user?.id, data.emailTemplateId);
      const payload: Partial<EmailTemplateWithAllFields> = {
        ...fullTemplate,
        name: `${fullTemplate.name} copy`,
      };
      delete payload.emailType;
      delete payload.isSystemTemplate;
      delete payload.emailTemplateId;
      delete payload.lastUpdated;
      const mjmlString = EditorCore.toMJML({
        element: payload?.json?.content,
        mode: 'production',
        beautify: true,
      });

      const { html } = mjml(mjmlString, {});
      const newTemp = await createEmailTemplate(user?.id || '', payload);
      htmlToThumbnail(html).then((dataUrl: any) => {
        createStorageItem({
          path: storagePaths.emailTemplateThumbnails(user?.id, newTemp?.emailTemplateId),
          file: dataUrl,
          isPublic: true,
        });
      });
      navigate(PATH_DASHBOARD.engagementHub.emailTemplateEdit(newTemp?.emailTemplateId));
    },
    [navigate, user?.id]
  );

  useEffect(() => {
    if (!loaded && !isLoading && user?.id) {
      dispatch(getEmailTemplates(user?.id));
    }
  }, [user?.id, isLoading, loaded, dispatch]);

  // Filter templates based on selected tab
  const filteredTemplates = useMemo(() => {
    if (!emailTemplates) return [];

    return emailTemplates.filter((template) =>
      currentTab === 'system'
        ? template.isSystemTemplate === true
        : template.isSystemTemplate !== true
    );
  }, [emailTemplates, currentTab]);

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          sx={{ px: 2, bgcolor: 'background.neutral' }}
        >
          <Tab value="system" label="System Templates" />
          <Tab value="user" label="User Templates" />
        </Tabs>
      </Card>

      {!loaded && isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          {[...Array(4)].map((_, index) => (
            <TemplateCardSkeleton key={index} />
          ))}
        </Box>
      ) : filteredTemplates.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          {filteredTemplates.map((emailTemplate: EmailTemplate) => (
            <EmailTemplateCard
              key={emailTemplate.emailTemplateId}
              data={emailTemplate}
              onDelete={(data) => onDelete(data.emailTemplateId)}
              onEdit={() => onEdit(emailTemplate.emailTemplateId)}
              onSend={() => onSend(emailTemplate.emailTemplateId)}
              onClone={onClone}
            />
          ))}
        </Box>
      ) : (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">
              {currentTab === 'system'
                ? 'No system templates available'
                : 'No user templates found'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {currentTab === 'user' && 'Create a new template to get started.'}
            </Typography>
          </Stack>
        </Card>
      )}
      {selectedTemplateId && (
        <RecipientsSelectDialog
          emailTemplateId={selectedTemplateId}
          open={!!selectedTemplateId}
          onClose={() => setSelectedTemplateId(null)}
        />
      )}
    </>
  );
}
