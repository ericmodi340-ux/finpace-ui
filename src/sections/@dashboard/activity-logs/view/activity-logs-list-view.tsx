import { Tab, Card, Stack, Tabs, alpha, useTheme, Alert, AlertTitle } from '@mui/material';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import { useEffect, useState } from 'react';
import { PATH_DASHBOARD } from 'routes/paths';
import MyActivityLogsListView from '../my-activity-list';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import { useDispatch, useSelector } from 'redux/store';
import { getAdvisorActivityLogs, getFirmActivityLogs } from 'redux/slices/activityLogs';

export default function ActivityLogsListView() {
  const [tabValue, setTabValue] = useState('my');
  const dispatch = useDispatch();

  const [filters, setFilters] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  const { advisorActivityLogs, isLoading: myActivityLogsLoading } = useSelector(
    (state) => state.activityLogs
  );
  const { firmActivityLogs, isLoading: firmActivityLogsLoading } = useSelector(
    (state) => state.activityLogs
  );

  const theme = useTheme();
  const { authUser } = useUser();

  useEffect(() => {
    dispatch(
      getFirmActivityLogs({
        firmId: authUser?.firmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    );
  }, [authUser?.firmId, dispatch, filters.endDate, filters.startDate]);

  useEffect(() => {
    dispatch(
      getAdvisorActivityLogs({
        advisorId: authUser?.sub,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    );
  }, [authUser?.sub, dispatch, filters.endDate, filters.startDate]);

  return (
    <Stack>
      <HeaderBreadcrumbs
        heading="Ledger"
        links={[
          { name: 'Dashboard', href: PATH_DASHBOARD.root },
          { name: 'Ledger', href: PATH_DASHBOARD.ledger.root },
          { name: 'List' },
        ]}
      />
      <Alert sx={{ mb: 3, mt: -3 }} severity="info" variant="outlined">
        Below is a list of all activity logs from the past 30 days. For a more detailed history,
        please export the data.
      </Alert>
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            px: 2.5,
            pt: 1,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Tab value="my" label="My Ledger" iconPosition="end" />
          {authUser?.role === roles.FIRM_ADMIN && (
            <Tab value="firm" label="Firm Ledger" iconPosition="end" />
          )}
        </Tabs>
        {tabValue === 'my' ? (
          <MyActivityLogsListView
            activityLogs={advisorActivityLogs}
            isLoading={myActivityLogsLoading}
            type="my"
            key={'my'}
            filters={filters}
            setFilters={setFilters}
          />
        ) : (
          <MyActivityLogsListView
            activityLogs={firmActivityLogs}
            isLoading={firmActivityLogsLoading}
            type="firm"
            key={'firm'}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </Card>
    </Stack>
  );
}
