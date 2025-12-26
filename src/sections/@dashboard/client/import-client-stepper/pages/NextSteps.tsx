import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Divider, Typography, Button, Stack } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
//
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

export default function NextSteps({
  client,
  onContinue,
  currentOptions,
  isProspect = false,
}: {
  client: any;
  onContinue: VoidFunction;
  isProspect?: boolean;
  currentOptions?: any;
}) {
  const navigate = useNavigate();

  const clientType = currentOptions?.clientType === 'client' ? 'customer' : 'prospect';

  const STEPS = [
    {
      title: 'Add a form',
      description: `Now that your ${clientType} is added, make a new form for them.`,
      icon: 'eva:file-add-fill',
      handleSelect: () => navigate(`${PATH_DASHBOARD.forms.root}/new?clientId=${client?.id}`),
    },
    {
      title: `View this ${clientType}'s profile`,
      description: 'Fill in some more basics and personalize their experience.',
      icon: 'eva:folder-fill',
      handleSelect: () => navigate(`${PATH_DASHBOARD.clients.root}/${client?.id}`),
    },
    {
      title: `Create a new ${clientType}`,
      description: isProspect ? 'Start adding a new prospect.' : 'Start onboarding a new client.',
      icon: 'eva:person-add-fill',
      handleSelect: () => navigate(`${PATH_DASHBOARD.clients.root}`),
    },
  ];

  const AUTOMATION_STEPS = [
    {
      title: 'Go to Automations hub',
      description: `Your scheduled jobs are started, but you can always check it out.`,
      icon: 'eva:file-add-fill',
      handleSelect: () => navigate(`${PATH_DASHBOARD.automation.root}`),
    },
  ];

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 600 },
        // width: `calc(100vw - ${theme.spacing(1)} * 2)`,
        position: 'relative',
        // left: `calc(-50vw + ${theme.spacing(1)} + 50%)`,
        mt: 3,
        mb: 3,
      }}
    >
      <Stack
        sx={{
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        spacing={2}
      >
        {(currentOptions?.automation ? AUTOMATION_STEPS : STEPS).map((step, idx) => (
          <Button
            sx={{
              textTransform: 'none',
            }}
            size="large"
            key={idx}
            variant="outlined"
            onClick={step.handleSelect}
          >
            {step.title}
          </Button>
        ))}
        {/* <Grid
          container
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5,
            textAlign: 'left',
          }}
        >
          {(currentOptions?.automation ? AUTOMATION_STEPS : STEPS).map((step, idx) => (
            <Fragment key={idx}>
              <Grid item xs sx={{ p: 3, cursor: 'pointer' }} onClick={step.handleSelect}>
                <Iconify
                  icon={step.icon}
                  width={24}
                  height={24}
                  sx={{ mb: 1, color: 'text.secondary' }}
                />
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>{step.title}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{step.description}</Typography>
              </Grid>
              {idx < STEPS.length - 1 && <Divider orientation="vertical" flexItem />}
            </Fragment>
          ))}
        </Grid> */}
      </Stack>
    </Box>
  );
}
