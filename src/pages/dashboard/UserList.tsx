import { Link as RouterLink } from 'react-router-dom';
import { capitalCase } from 'change-case';
// @mui
import { Card, Button, Container, Tooltip } from '@mui/material';
// @types
import { UserRole } from '../../@types/user';
// redux
import { useSelector } from 'redux/store';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListTable } from '../../sections/@dashboard/user/list';
import useIntegrations from 'hooks/useIntegrations';

// ----------------------------------------------------------------------

type UserListProps = {
  type: UserRole.ADVISOR | UserRole.FIRM_ADMIN | UserRole.CLIENT;
  isProspect?: boolean;
};

export default function UserList({ type, isProspect = false }: UserListProps) {
  const { themeStretch } = useSettings();
  const { firm } = useSelector((state) => state.firm);

  const typeName = isProspect ? 'prospect' : type;
  const capitalizedType = capitalCase(typeName.replace('-', ' '));
  const title = `${capitalizedType}s`;
  const { integrations } = useIntegrations();

  return (
    <Page title={title}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: title, href: PATH_DASHBOARD[`${typeName}s`].root },
            { name: 'List' },
          ]}
          action={
            type === UserRole.CLIENT && firm?.ssoClientsOnly ? null : (
              <>
                {type !== UserRole.ADVISOR && type !== UserRole.FIRM_ADMIN && (
                  <Tooltip title={!integrations.length ? 'No integrations found' : ''}>
                    <span>
                      <Button
                        variant="contained"
                        sx={{ mr: 1 }}
                        color="info"
                        component={RouterLink}
                        disabled={!integrations.length}
                        // @ts-ignore
                        to={PATH_DASHBOARD[`${typeName}s`]?.import || ''}
                        startIcon={<Iconify icon={'eva:plus-fill'} />}
                      >
                        Import {capitalizedType}
                      </Button>
                    </span>
                  </Tooltip>
                )}
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={PATH_DASHBOARD[`${typeName}s`]?.new || ''}
                  startIcon={<Iconify icon={'eva:plus-fill'} />}
                >
                  New {capitalizedType}
                </Button>
              </>
            )
          }
        />

        <Card>
          <UserListTable type={type} isProspect={isProspect} pageSize={10} />
        </Card>
      </Container>
    </Page>
  );
}
