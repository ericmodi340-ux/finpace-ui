import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Link } from '@mui/material';
// @types
import { DisclosureType } from '../../../../@types/disclosure';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// sections
import Disclosures from '../disclosures/Disclosures';
// constants
import { types } from 'constants/disclosures';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

export default function FirmDisclosures({ isAdvisor = false }: { isAdvisor?: boolean }) {
  const theme = useTheme();
  const { user } = useUser();

  return (
    <>
      {isAdvisor && (
        <Alert icon={false} sx={{ mb: 3, background: theme.palette.primary.main, color: 'white' }}>
          <AlertTitle>Manage your advisor and firm disclosures</AlertTitle>
          You can upload and manage disclosures on behalf of the firm which can be included in
          templates below. Since you are also an advisor, you can upload and manage your advisor
          disclosures in your{' '}
          <Link
            to={`${PATH_DASHBOARD.settings.account}?t=disclosures`}
            color={'white'}
            fontWeight="600"
            sx={{ textDecoration: 'underline' }}
            component={RouterLink}
          >
            user settings
          </Link>
          .
        </Alert>
      )}
      <Disclosures type={types.FIRM as DisclosureType.FIRM} userId={user?.id || ''} />
    </>
  );
}
