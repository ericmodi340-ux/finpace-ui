import { capitalCase, sentenceCase } from 'change-case';
import { useParams } from 'react-router-dom';
// @mui
import {
  Container,
  Tab,
  Box,
  Tabs,
  Alert,
  AlertTitle,
  Tooltip,
  Card,
  Stack,
  CircularProgress,
  styled,
  Badge,
} from '@mui/material';
// @types
import { ClientManager } from '../../@types/client';
import { UserRole } from '../../@types/user';
// hooks
import useParamTabs from 'hooks/useParamTabs';
import useSettings from 'hooks/useSettings';
import useUserFromStore from 'hooks/useUserFromStore';
// components
import Page from 'components/Page';
// sections
import {
  ClientFirstInvestor,
  ClientSecondInvestor,
  ClientFormsDocuments,
  ClientActions,
  ClientNotes,
} from 'sections/@dashboard/client/profile';
// utils
import { getClientCompositeName } from 'utils/clients';
// constants
import { roles } from 'constants/users';
import { ClientSMS } from 'sections/@dashboard/client/profile/ClientSMS';
import {
  clearMeetingNotes,
  clearNotes,
  getClientMeetingNotes,
  getClientNotes,
} from 'redux/slices/client';
import { useDispatch, useSelector } from 'redux/store';
import { useEffect } from 'react';
import ClientDocuvault from 'sections/@dashboard/client/profile/ClientDocuvault';
import ProfileCoverClient from 'components/ProfileCoverClient';
import ClientSettings from 'sections/@dashboard/client/profile/ClientSettings';
import { useBoolean } from 'hooks/useBoolean';
import SvgIconStyle from 'components/SvgIconStyle';
import useAdvisorTasks from 'hooks/useAdvisorTasks';
import { BadgeProps } from '@mui/material';
import { getForms } from 'redux/slices/forms';
import { getEnvelopes } from 'redux/slices/envelopes';
import { getClientById } from 'redux/slices/clients';

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(60deg, #F90F90 0%, #D40005 100%)',
  },
}));

export const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  width: '100%',
  display: 'flex',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
    // paddingRight: theme.spacing(3),
    // paddingLeft: theme.spacing(3),
  },
}));

// ----------------------------------------------------------------------

export default function ClientProfile({ isProspect = false }: { isProspect?: boolean }) {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { clientId = '' } = useParams();

  const currentClient = useUserFromStore(
    clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;
  const clientName = getClientCompositeName(currentClient);

  const openSettings = useBoolean();

  const { themeMode } = useSettings();

  const { byId: formsById, loaded: formsLoaded } = useSelector((state) => state.forms);

  const { byId: advisorsById } = useSelector((state) => state.advisors);

  const { loaded: envelopeLoaded } = useSelector((state) => state.envelopes);

  useEffect(() => {
    if (clientId) {
      getClientById(clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (!formsLoaded) {
      dispatch(getForms());
    }
    if (!envelopeLoaded) {
      dispatch(getEnvelopes());
    }
  }, [dispatch, envelopeLoaded, formsLoaded]);

  const advisorName =
    `${advisorsById[currentClient?.advisorId]?.name} (${
      advisorsById[currentClient?.advisorId]?.email
    })` || 'No Advisor';

  const { isLoading } = useSelector((state: any) => state.clients);

  const clientType = isProspect || currentClient?.isProspect ? 'prospect' : 'client';

  const { currentTab, setCurrentTab } = useParamTabs('first_investor');
  useEffect(() => {
    dispatch(getClientNotes(clientId));
    dispatch(getClientMeetingNotes(clientId));

    // Clean state when unmounting
    return () => {
      dispatch(clearNotes());
      dispatch(clearMeetingNotes());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const { formsAwaitingAdvisorReview } = useAdvisorTasks(formsById, 6, clientId);

  const PROFILE_TABS = [
    {
      value: 'first_investor',
      label: 'Primary Investor',
      icon: (
        <SvgIconStyle
          src={`/icons/primary-lnvestor-${themeMode}-mode.svg`}
          sx={{ width: 23, height: 23 }}
        />
      ),
      component: <ClientFirstInvestor currentClient={currentClient} clientId={clientId} />,
    },
    {
      value: 'second_investor',
      label: 'Joint Investor',
      icon: (
        <SvgIconStyle
          src={`/icons/joint-investor-${themeMode}-mode.svg`}
          sx={{ width: 23, height: 23 }}
        />
      ),
      component: <ClientSecondInvestor currentClient={currentClient} clientId={clientId} />,
    },
    {
      value: 'notes',
      icon: (
        <SvgIconStyle src={`/icons/notes-${themeMode}-mode.svg`} sx={{ width: 23, height: 23 }} />
      ),
      component: <ClientNotes currentClient={currentClient} clientId={clientId} />,
    },
    {
      value: 'forms_documents',
      label: (
        <span
          style={{
            marginRight: '10px',
          }}
        >
          <StyledBadge badgeContent={formsAwaitingAdvisorReview?.length} color="error">
            <span
              style={{
                marginRight: '14px',
              }}
            >
              Forms & Documents
            </span>
          </StyledBadge>
        </span>
      ),
      icon: (
        <SvgIconStyle src={`/icons/forms-${themeMode}-mode.svg`} sx={{ width: 20, height: 20 }} />
      ),
      component: (
        <ClientFormsDocuments
          clientId={clientId}
          isProspect={Boolean(isProspect || currentClient?.isProspect)}
        />
      ),
    },
    {
      value: 'docuvault',
      label: 'DocuVault',
      icon: (
        <SvgIconStyle
          src={`/icons/docuVault-${themeMode}-mode.svg`}
          sx={{ width: 20, height: 20 }}
        />
      ),
      component: <ClientDocuvault clientId={clientId} />,
    },
    {
      value: 'Chat',
      label: !currentClient?.phoneNumber ? (
        <Tooltip
          arrow
          placement="top"
          title="No phone number available for the client, please add it to use this feature."
        >
          <span>SMS</span>
        </Tooltip>
      ) : (
        <span>SMS</span>
      ),
      icon: (
        <SvgIconStyle src={`/icons/sms-${themeMode}-mode.svg`} sx={{ width: 20, height: 20 }} />
      ),
      component: !currentClient?.phoneNumber ? (
        <Alert severity="warning">
          <AlertTitle>Info</AlertTitle>
          No phone number available for the client —{' '}
          <strong>please add it to use this feature.</strong>
        </Alert>
      ) : (
        <ClientSMS
          advisorId={currentClient?.advisorId}
          clientId={clientId}
          clientPhone={currentClient?.phoneNumber}
        />
      ),
      disabled: false,
    },
    ...(clientId
      ? [
          {
            value: 'actions',
            icon: (
              <SvgIconStyle
                src={`/icons/actions-${themeMode}-mode.svg`}
                sx={{ width: 20, height: 20 }}
              />
            ),
            component: (
              <ClientActions
                clientId={clientId}
                isProspect={Boolean(isProspect || currentClient?.isProspect)}
              />
            ),
          },
        ]
      : []),
    // {
    //   value: 'financials',
    //   icon: <Iconify icon={'ic:round-money'} width={20} height={20} />,
    //   component: <ClientFirstInvestor currentClient={currentClient} clientId={clientId} />,
    // },
    // {
    //   value: 'profile_experience',
    //   label: 'Profile & Experience',
    //   icon: <Iconify icon={'ic:round-cases'} width={20} height={20} />,
    //   component: <ClientFirstInvestor currentClient={currentClient} clientId={clientId} />,
    // },
    // {
    //   value: 'retirement',
    //   icon: <Iconify icon={'ic:round-directions-boat'} width={20} height={20} />,
    //   component: <ClientFirstInvestor currentClient={currentClient} clientId={clientId} />,
    // },
    // {
    //   value: 'settings',
    //   icon: <Iconify icon={'ic:round-settings'} width={20} height={20} />,
    //   component: <ClientFirstInvestor currentClient={currentClient} clientId={clientId} />,
    // },
  ];

  if (isLoading && !currentClient) {
    return (
      <Stack flexGrow={1} pt={10} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Page title={`Edit ${clientName || clientType}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        {currentClient && (
          <>
            <Card
              sx={{
                position: 'relative',
              }}
            >
              <ProfileCoverClient
                advisorName={advisorName}
                id={currentClient.id}
                name={currentClient?.name || ''}
                isProspect={Boolean(currentClient?.isProspect)}
                currentClient={currentClient}
              />

              {openSettings.value && (
                <ClientSettings
                  currentClient={currentClient}
                  open={openSettings.value}
                  onClose={openSettings.onFalse}
                />
              )}

              <TabsWrapperStyle>
                <Tabs
                  value={currentTab}
                  scrollButtons
                  variant="scrollable"
                  allowScrollButtonsMobile
                  onChange={(_e, value) => setCurrentTab(value)}
                >
                  {PROFILE_TABS.map((tab) => (
                    <Tab
                      disableRipple
                      key={tab.value}
                      label={tab.label || capitalCase(tab.value)}
                      icon={tab.icon}
                      value={tab.value}
                      disabled={tab.disabled}
                    />
                  ))}
                </Tabs>
              </TabsWrapperStyle>
            </Card>

            {PROFILE_TABS.map((tab) => {
              const isMatched = tab.value === currentTab;
              return (
                isMatched && (
                  <Box
                    sx={{
                      mt: 3,
                    }}
                    key={tab.value}
                  >
                    {tab.component}
                  </Box>
                )
              );
            })}
          </>
        )}

        {!currentClient && !isLoading && (
          <Alert severity="warning">
            <AlertTitle>{sentenceCase(clientType)} not found</AlertTitle>
            We could not find a {clientType} with this ID. Please try again.
          </Alert>
        )}
      </Container>
    </Page>
  );
}
