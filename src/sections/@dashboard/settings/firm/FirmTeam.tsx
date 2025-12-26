// @mui
import { Card, Grid, Stack, Typography, Box } from '@mui/material';
// sections
import TeamInviteForm from 'sections/@dashboard/team/TeamInviteForm';
import TeamListTable from './TeamListTable';

// ----------------------------------------------------------------------

export default function FirmTeam() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={0} sx={{ width: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Add Team Members
            </Typography>
            <Box
              sx={{
                mx: -6,
                '& > form > .MuiDialogActions-root': { marginLeft: '48px', marginRight: '48px' },
              }}
            >
              <TeamInviteForm />
            </Box>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <Stack spacing={2} sx={{ py: 3, px: 3, pb: 1, width: 1, textAlign: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary' }}>
                Existing Team Members
              </Typography>
            </div>
          </Stack>
          <TeamListTable />
        </Card>
      </Grid>
    </Grid>
  );
}
