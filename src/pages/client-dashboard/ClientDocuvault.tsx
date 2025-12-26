import { Stack, Container } from '@mui/material';
import Page from 'components/Page';
import useUser from 'hooks/useUser';
import ClientDocuvault from 'sections/@dashboard/client/profile/ClientDocuvault';

export default function ClientDocuvaultPage() {
  const { user } = useUser();

  return (
    <Page title="Docuvault">
      <Container>
        <Stack mt={3}>{user?.id && <ClientDocuvault clientId={user?.id} />}</Stack>
      </Container>
    </Page>
  );
}
