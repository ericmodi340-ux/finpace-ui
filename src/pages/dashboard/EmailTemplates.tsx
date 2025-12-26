// @mui
import { Button, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import EmailTemplatesList from '../../sections/@dashboard/engagement-hub/email-templates/email-templates-list';
import { useBoolean } from 'hooks/useBoolean';
import EmailTemplateNewModal from 'sections/@dashboard/engagement-hub/email-templates/email-template-new-modal';

// ----------------------------------------------------------------------

export default function EmailTemplates() {
  const { themeStretch } = useSettings();
  const open = useBoolean();

  return (
    <Page title="Email Templates">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Engagement Hub"
          links={[
            { name: 'Engagement Hub', href: PATH_DASHBOARD.engagementHub.emailTemplates },
            {
              name: 'Email Templates',
            },
          ]}
          action={
            <Button onClick={() => open.onTrue()} variant="contained" color="primary">
              New Template
            </Button>
          }
        />

        <EmailTemplatesList />
        {open.value && (
          <EmailTemplateNewModal fullWidth maxWidth="xs" open={open.value} onClose={open.onFalse} />
        )}
      </Container>
    </Page>
  );
}
