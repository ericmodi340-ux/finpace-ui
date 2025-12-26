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

// ----------------------------------------------------------------------

export default function AdvisorDisclosures({
  isAdmin = false,
  userId,
}: {
  isAdmin?: boolean;
  userId: string;
}) {
  const theme = useTheme();

  return (
    <>
      {isAdmin && (
        // @ts-ignore
        <Alert
          variant="standard"
          severity="info"
          icon={false}
          sx={{
            mb: 3,
            backgroundColor: theme.palette.primary.light,
          }}
        >
          <AlertTitle sx={{ color: theme.palette.primary.darker }}>
            Manage your advisor and firm disclosures
          </AlertTitle>
          <span style={{ color: theme.palette.primary.dark }}>
            Since you are also an advisor, you can upload and manage your advisor disclosures below.
            To upload and manage disclosures on behalf of the firm, go to{' '}
            <Link
              to={`${PATH_DASHBOARD.settings.firm}?t=disclosures`}
              color={theme.palette.secondary.main}
              component={RouterLink}
            >
              firm settings
            </Link>
            .
          </span>
        </Alert>
      )}
      <Disclosures type={types.ADVISOR as DisclosureType.ADVISOR} userId={userId} />
    </>
  );
}
