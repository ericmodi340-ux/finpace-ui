import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Card, Button, Typography, Stack } from '@mui/material';
// @types
import { FormManager } from '../../../../@types/form';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { API } from 'aws-amplify';
// components
import Iconify from 'components/Iconify';
// sections
import ClientFormsTable from './ClientFormsTable';
import { AdvisorPendingFormCards, ClientPendingFormCards } from '.';
// constants
import { formStatuses } from 'constants/forms';
import { roles } from 'constants/users';
// hooks
import useUser from 'hooks/useUser';
// utils
import { fDate } from 'utils/formatTime';
import useSettings from 'hooks/useSettings';
import { UserRole } from '../../../../@types/user';
import * as Sentry from '@sentry/react';

// ----------------------------------------------------------------------

type ClientFormsDocumentsProps = {
  clientId: string;
  isClient?: boolean;
  isProspect?: boolean;
};

export default function ClientFormsDocuments({
  clientId,
  isClient,
  isProspect,
}: ClientFormsDocumentsProps) {
  const { authUser } = useUser();
  const isAdvisor = [roles.ADVISOR, roles.FIRM_ADMIN].includes(authUser?.role);

  // Local state for client forms with envelope data
  const [clientForms, setClientForms] = useState<FormManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch client forms with envelope data
  const fetchClientFormsWithEnvelopes = async (clientId: string) => {
    setIsLoading(true);
    try {
      const response = await API.get('bitsybackendv2', `/forms?clientId=${clientId}`, {});
      setClientForms(response || []);
    } catch (error) {
      console.error('Error fetching client forms:', error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error fetching client forms with envelopes in ClientFormsDocuments',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientFormsWithEnvelopes(clientId);
    }
  }, [clientId]);

  return (
    <>
      <Grid container spacing={3}>
        {isAdvisor && (
          <Grid item xs={12} spacing={3}>
            <Card sx={{ width: '100%', px: 3 }}>
              {isAdvisor && <AdvisorPendingFormCards clientId={clientId} />}
              {!isAdvisor && (
                <ClientPendingFormCards
                  clientId={clientId}
                  isClient={isClient}
                  isProspect={isProspect}
                />
              )}
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <ClientFormsTable
              clientForms={clientForms}
              isLoading={isLoading}
              onRefresh={() => fetchClientFormsWithEnvelopes(clientId)}
              hideColumns={['clientName', 'advisorName']}
            />
            {isAdvisor && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                sx={{ px: 2, pb: 2 }}
              >
                <Button
                  variant="outlined"
                  component={Link}
                  sx={{
                    width: 150,
                  }}
                  to={`${PATH_DASHBOARD.forms.new}?clientId=${clientId}`}
                >
                  New Form
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

// ----------------------------------------------------------------------

type FormCardProps = {
  form: FormManager;
  continueForm?: boolean;
  showClientName?: boolean;
  clientName?: string;
};

export function FormCard({
  form,
  showClientName = false,
  clientName = '',
  continueForm = false,
}: FormCardProps) {
  const theme = useTheme();
  const { themeMode } = useSettings();
  const isDark = themeMode === 'dark';
  const navigate = useNavigate();
  const { authUser } = useUser();

  const isAdvisor = [roles.ADVISOR, roles.FIRM_ADMIN].includes(authUser?.role);

  function getUserRole() {
    if (isAdvisor) {
      return UserRole.ADVISOR;
    }
    return UserRole.CLIENT;
  }

  const {
    id,
    currentReviewerRole,
    status,
    createdAt,
    dateSent,
    dateCompleted,
    dateCancelled,
    formTitle,
  } = form;

  // Handle getting template on client dashboards

  let statusString: string = '';

  if (status === formStatuses.DRAFT && createdAt) {
    statusString = `Started ${fDate(new Date(createdAt), 'MMMM d, yyyy p')}`;
  } else if (status === formStatuses.SENT && currentReviewerRole === getUserRole() && dateSent) {
    statusString = `Received ${fDate(new Date(dateSent), 'MMMM d, yyyy p')}`;
  } else if (status === formStatuses.SENT && currentReviewerRole !== getUserRole() && dateSent) {
    statusString = `Sent ${fDate(new Date(dateSent), 'MMMM d, yyyy p')}`;
  } else if (status === formStatuses.COMPLETED && dateCompleted) {
    statusString = `Completed ${fDate(new Date(dateCompleted), 'MMMM d, yyyy p')}`;
  } else if (status === formStatuses.CANCELLED && dateCancelled) {
    statusString = `Cancelled ${fDate(new Date(dateCancelled), 'MMMM d, yyyy p')}`;
  }

  let userHasAction = false;
  if (
    // [roles.FIRM_ADMIN, roles.ADVISOR].includes(authUser?.role) ||
    currentReviewerRole === getUserRole()
  ) {
    userHasAction = true;
  }

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Iconify
        icon={
          status === formStatuses.COMPLETED
            ? 'eva:checkmark-circle-2-fill'
            : userHasAction
              ? 'eva:alert-triangle-fill'
              : 'eva:clock-fill'
        }
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          color:
            status === formStatuses.COMPLETED
              ? theme.palette.success.main
              : continueForm
                ? theme.palette.info.main
                : userHasAction
                  ? theme.palette.primary.main
                  : theme.palette.success.main,
        }}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0, pl: 2, pr: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {formTitle || 'Your Form'}
        </Typography>
        {showClientName && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {clientName}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {statusString}
          </Typography>
        </Box>
      </Box>
      {status === formStatuses.COMPLETED ? (
        <></>
      ) : status === formStatuses.SENT && !userHasAction && authUser?.role === UserRole.CLIENT ? (
        <Button
          size="small"
          variant={'text'}
          color={'primary'}
          startIcon={<Iconify icon={'eva:checkmark-fill'} />}
          disabled
          sx={{ flexShrink: 0 }}
        >
          In Review
        </Button>
      ) : (
        <Button
          size="small"
          onClick={() => navigate(`${PATH_DASHBOARD.forms.root}/${id}`)}
          variant={'outlined'}
          color={continueForm ? 'info' : 'error'}
          sx={{ flexShrink: 0, color: isDark ? theme.palette.info.lighter : '' }}
        >
          {continueForm ? 'Continue Form' : 'Continue'}
        </Button>
      )}
    </Card>
  );
}
