// @mui
import {
  Select,
  MenuItem,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Stack,
  Typography,
  Button,
  ListItemIcon,
  Checkbox,
  IconButton,
  Popover,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
// components
import Page from '../../components/Page';
import { WidgetSummary } from 'sections/@dashboard/general/widgets';
import { PATH_DASHBOARD } from 'routes/paths';
import { memo, useState } from 'react';
import GettingStarted from './GettingStarted';
import EnvelopesWidget from 'components/EnvelopesWidget';
import { EnvelopeSigningStatus } from '../../@types/envelope';
import useDashboardData from 'hooks/useDashboardData';
import ClientGrowth from 'components/ClientGrowth';
import PendingActions from 'components/PendingActions';
import AumChartWidget from 'components/AumChartWidget';
import { Link as RouterLink } from 'react-router-dom';
import Iconify from 'components/Iconify';
import { usePopover } from 'components/custom-popover';
import useSettings from 'hooks/useSettings';
import SvgIconStyle from 'components/SvgIconStyle';
import GettingStartedVideos from './GetStartedVideos';
import { VideoDataAdvisor, VideoDataFirmAdmin } from '_mock/_get_started_videos';
import useUser from 'hooks/useUser';
import { UserRole } from '../../@types/user';

const Dashboard = memo(() => {
  const {
    isGettingStartedVisible,
    user,
    dataDaysRange,
    setDataDaysRange,
    newClientsByDays,
    newProspectByDays,
    completedFormsByDays,
    envelopesData,
    completedEnvelopesByDays,
    clientsGrowthData,
    prospectsGrowthData,
    pendingActionsArray,
    aumTableData,
    setPeriod,
    period,
  } = useDashboardData();

  const { authUser } = useUser();

  const [showAll, setShowAll] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string | null>(null);

  const { themeMode } = useSettings();

  const popover = usePopover();

  return (
    <Page title="Dashboard">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {isGettingStartedVisible ? (
            <>
              <Grid item xs={12} md={12}>
                <GettingStarted />
              </Grid>
              <Grid item xs={12} md={12}>
                <GettingStartedVideos
                  title="Get Started"
                  list={
                    authUser?.role === UserRole?.FIRM_ADMIN ? VideoDataFirmAdmin : VideoDataAdvisor
                  }
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Stack
                  flexDirection={{ sm: 'row' }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h4">
                    Hi, Welcome {user?.name?.split(' ')[0] || 'User'}
                  </Typography>
                  <FormControl>
                    <InputLabel id="Days select">Data Range</InputLabel>
                    <Select
                      labelId="Days select"
                      name="dataDaysRange"
                      size="small"
                      value={dataDaysRange}
                      label="Data Range"
                      onChange={(e) => setDataDaysRange(Number(e.target.value))}
                      sx={{
                        minWidth: 220,
                      }}
                    >
                      <MenuItem value={30}>30 Days</MenuItem>
                      <MenuItem value={182}>6 Months</MenuItem>
                      <MenuItem value={365}>1 year</MenuItem>
                      <MenuItem value={0}>All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} container spacing={3}>
                <Grid item xs={12} md={3}>
                  <WidgetSummary
                    title={dataDaysRange !== 0 ? 'New Clients' : 'Total Clients'}
                    total={
                      dataDaysRange !== 0
                        ? `+ ${newClientsByDays.length}`
                        : String(newClientsByDays?.length)
                    }
                    link={PATH_DASHBOARD.clients.root}
                    imgSrc={
                      themeMode === 'dark'
                        ? `/icons/clients-dark-mode.svg`
                        : `/icons/clients-light-mode.svg`
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <WidgetSummary
                    title={dataDaysRange !== 0 ? 'New Prospects' : 'Total Prospects'}
                    total={
                      dataDaysRange !== 0
                        ? `+ ${newProspectByDays.length}`
                        : String(newProspectByDays?.length)
                    }
                    link={PATH_DASHBOARD.clients.root}
                    imgSrc={
                      themeMode === 'dark'
                        ? `/icons/prospects-dark-mode.svg`
                        : `/icons/prospects-light-mode.svg`
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <WidgetSummary
                    title={dataDaysRange !== 0 ? 'Form Completed' : 'Forms Completed'}
                    total={
                      dataDaysRange !== 0
                        ? `+ ${completedFormsByDays.length}`
                        : String(completedFormsByDays?.length)
                    }
                    link={PATH_DASHBOARD.general.webForms}
                    imgSrc={
                      themeMode === 'dark'
                        ? `/icons/forms-dark-mode.svg`
                        : `/icons/forms-light-mode.svg`
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <WidgetSummary
                    title="Envelopes Completed"
                    total={
                      dataDaysRange !== 0
                        ? `+ ${completedEnvelopesByDays.length}`
                        : String(completedEnvelopesByDays?.length)
                    }
                    link={PATH_DASHBOARD.general.signingStatus}
                    imgSrc={
                      themeMode === 'dark'
                        ? `/icons/envelopes-dark-mode.svg`
                        : `/icons/envelopes-light-mode.svg`
                    }
                  />
                </Grid>
              </Grid>

              {!!pendingActionsArray?.length && (
                <>
                  <Grid item xs={12}>
                    <Stack
                      flexDirection={{ sm: 'row' }}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mt: 1,
                      }}
                    >
                      <Typography variant="h4">Unfinished Tasks</Typography>
                      <Stack direction="row" spacing={2}>
                        <IconButton onClick={popover.onOpen}>
                          <SvgIconStyle
                            src={
                              selectedOptions
                                ? `/icons/task-filter-active-${themeMode}-mode.svg`
                                : `/icons/task-filter-${themeMode}-mode.svg`
                            }
                          />
                          {/* <Iconify
                            icon={selectedOptions ? 'mdi:filter-cog' : `mdi:filter-outline`}
                          /> */}
                        </IconButton>
                        <Popover
                          open={!!popover.open}
                          anchorEl={popover.open}
                          onClose={popover.onClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                        >
                          <Stack>
                            {[
                              {
                                label: 'Forms',
                                value: 'form',
                              },
                              {
                                label: 'Envelopes',
                                value: 'envelope',
                              },
                            ].map((option) => (
                              <MenuItem
                                key={option.value}
                                onClick={() => {
                                  if (selectedOptions === option.value) {
                                    setSelectedOptions(null);
                                  } else {
                                    setSelectedOptions(option.value);
                                  }
                                }}
                                value={option.value}
                              >
                                <ListItemIcon>
                                  <Checkbox checked={selectedOptions === option.value} />
                                </ListItemIcon>
                                <ListItemText primary={option.label} />
                              </MenuItem>
                            ))}
                          </Stack>
                        </Popover>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setShowAll(!showAll)}
                        >
                          {showAll ? 'View Less' : 'View All'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <PendingActions
                      showAll={showAll}
                      selectedOptions={selectedOptions}
                      pendingActionsArray={pendingActionsArray}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Stack
                  flexDirection={{ sm: 'row' }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack spacing={1}>
                    <Typography variant="h4">Customer Growth</Typography>
                    <ToggleButtonGroup
                      value={period}
                      exclusive
                      size="small"
                      sx={{
                        background: 'transparent',
                      }}
                      onChange={(e, value) => setPeriod(value)}
                    >
                      {[
                        {
                          label: '1d',
                          value: '1d',
                        },
                        {
                          label: '5d',
                          value: '5d',
                        },
                        {
                          label: '1m',
                          value: '1m',
                        },
                        {
                          label: '6m',
                          value: '6m',
                        },
                        {
                          label: '1y',
                          value: '1y',
                        },
                        {
                          label: 'Max',
                          value: 'max',
                        },
                      ].map((option) => (
                        <ToggleButton
                          key={option.value}
                          sx={{
                            minWidth: 50,
                            height: 25,
                          }}
                          value={option.value}
                        >
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    {/* <Stack direction="row" alignItems="center">
                      <Typography
                        sx={{
                          color: (theme) => theme.palette.text.secondary,
                        }}
                        variant="body1"
                      >
                        <span>Customer growth {period}</span>
                      </Typography>
                      <Iconify
                        sx={{
                          cursor: 'pointer',
                        }}
                        onClick={popoverGrowth.onOpen}
                        height={25}
                        width={25}
                        icon="mdi:menu-down"
                      />
                    </Stack> */}
                    {/* <Popover
                      open={!!popoverGrowth.open}
                      anchorEl={popoverGrowth.open}
                      onClose={popoverGrowth.onClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                    /> */}
                  </Stack>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={PATH_DASHBOARD.clients.new}
                    startIcon={<Iconify icon={'eva:plus-fill'} />}
                    data-test="header-add-client-button"
                    sx={{
                      textTransform: 'none',
                    }}
                  >
                    Add Client(s)
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <ClientGrowth
                  title="Customer Growth"
                  subheader="Customer growth last 12 months"
                  chart={{
                    categories: clientsGrowthData.labels,
                    series: [
                      {
                        name: 'Clients',
                        data: clientsGrowthData.values,
                      },
                      {
                        name: 'Prospects',
                        data: prospectsGrowthData.values,
                      },
                    ],
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                {/* <AutomationHubWidget /> */}
                <EnvelopesWidget
                  title="Envelopes"
                  chart={{
                    colors: ['#1E1E1E', '#FFC83D', '#FF5C93', '#00AB55', '#FF0000'],
                    series: [
                      {
                        label: EnvelopeSigningStatus.CANCELLED,
                        value: envelopesData?.cancelled?.length || 0,
                      },
                      {
                        label: EnvelopeSigningStatus['Awaiting Advisor'],
                        value: envelopesData?.['Awaiting Advisor']?.length || 0,
                      },
                      {
                        label: EnvelopeSigningStatus['Awaiting Client'],
                        value: envelopesData?.['Awaiting Client']?.length || 0,
                      },
                      {
                        label: EnvelopeSigningStatus.COMPLETED,
                        value: envelopesData?.completed?.length || 0,
                      },
                    ],
                  }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <AumChartWidget
                  title="AUM Growth"
                  subheader="AUM growth last 12 months"
                  chart={{
                    categories: aumTableData.labels,
                    series: [
                      {
                        name: 'AUM',
                        data: aumTableData.values,
                      },
                    ],
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Page>
  );
});

export default Dashboard;
