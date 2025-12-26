import { Stack, Container } from '@mui/material';
import Page from 'components/Page';
import useUser from 'hooks/useUser';
import { ClientFormsDocuments } from 'sections/@dashboard/client/profile';

export default function ClientFormsDocumentsPage() {
  const { user } = useUser();

  return (
    <Page title="Forms & Documents">
      <Container>
        <Stack mt={3}>{user?.id && <ClientFormsDocuments clientId={user?.id} isClient />}</Stack>
      </Container>
    </Page>
  );
}
