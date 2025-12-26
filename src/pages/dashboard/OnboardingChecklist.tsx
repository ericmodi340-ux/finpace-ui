import {
  IconButton,
  LinearProgress,
  ListItem,
  ListItemText,
  useTheme,
  Divider,
  Dialog,
  DialogProps,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { ClientManager } from '../../@types/client';
import { FormManager } from '../../@types/form';
import { IntegrationConfig } from '../../@types/integration';
import Iconify from 'components/Iconify';
import { useMemo } from 'react';
import { useSelector } from 'redux/store';
import arrayFromObj from 'utils/arrayFromObj';
import useUser from 'hooks/useUser';
import { UserRole } from '../../@types/user';
import { PATH_DASHBOARD } from 'routes/paths';
import { useNavigate } from 'react-router';

type Props = DialogProps & {
  onClose: () => void;
  onComplete: () => void;
};

export default function OnboardingChecklist(props: Props) {
  const theme = useTheme();
  const { authUser } = useUser();

  const { onClose, onComplete } = props;

  const navigate = useNavigate();

  const clients = useSelector((state) => state.clients);
  const clientsArray = arrayFromObj(clients.byId, clients.allIds) as ClientManager[];

  const { integrations } = useSelector((state) => state.integrationsAdvisor);
  const filteredIntegrations = integrations.filter(
    (item: IntegrationConfig) => item.id !== 'docusign'
  );

  const { allIds: formsAllIds, byId: formsById } = useSelector((state) => state.forms);
  const { envelopes } = useSelector((state) => state.envelopes);
  const forms = useMemo(
    () => arrayFromObj(formsById, formsAllIds) as FormManager[],
    [formsAllIds, formsById]
  );

  const templatesList = useSelector((state) => state.templates);

  const completedSteps = useMemo(
    () => ({
      'client-created': !!clientsArray.length,
      'integrations-connected': !!filteredIntegrations.length,
      ...(authUser?.role === UserRole.FIRM_ADMIN
        ? {
            'template-created': !!templatesList.allIds.length,
          }
        : {}),
      'forms-created': !!forms.length || !!envelopes.length,
    }),
    [
      clientsArray.length,
      filteredIntegrations.length,
      authUser?.role,
      templatesList.allIds.length,
      forms.length,
      envelopes.length,
    ]
  );

  const totalSteps = authUser?.role === UserRole.FIRM_ADMIN ? 4 : 3;

  const stepsCompleted = useMemo(
    () => Object.entries(completedSteps).reduce((acc, [_, value]) => (value ? acc + 1 : acc), 0),
    [completedSteps]
  );

  return (
    <Dialog {...props} maxWidth="xs" fullWidth>
      <Stack px={2} py={1} flexDirection="row" justifyContent="space-between" alignItems="center">
        <Typography display="flex" alignItems="center" variant="h6">
          Get Started
          <Typography
            sx={{
              ml: 1,
            }}
            component="span"
            color="text.secondary"
          >
            {stepsCompleted} of {totalSteps} complete!
          </Typography>
        </Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Stack>

      <Stack px={2} pb={2}>
        <LinearProgress
          sx={{
            height: 8,
          }}
          variant="determinate"
          value={(stepsCompleted / totalSteps) * 100}
        />
        <Stack
          divider={<Divider />}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mt: 3,
          }}
        >
          <ListItem
            sx={{
              padding: 2,
            }}
            secondaryAction={
              <IconButton onClick={() => navigate(PATH_DASHBOARD.general.integrations)}>
                <Iconify icon="ic:baseline-chevron-right" />
              </IconButton>
            }
          >
            <Iconify
              icon={
                completedSteps['integrations-connected']
                  ? 'ic:outline-check-circle'
                  : 'ic:outline-circle'
              }
              sx={{
                mr: 1,
                width: 24,
                height: 24,
                color: completedSteps['integrations-connected']
                  ? theme.palette.success.main
                  : theme.palette.divider,
              }}
            />
            <ListItemText
              primary="Connect your CRM"
              primaryTypographyProps={{ variant: 'subtitle1' }}
            />
          </ListItem>

          {authUser?.role === UserRole.FIRM_ADMIN && (
            <ListItem
              sx={{
                padding: 2,
              }}
              secondaryAction={
                <IconButton onClick={() => navigate(PATH_DASHBOARD.templates.root)}>
                  <Iconify icon="ic:baseline-chevron-right" />
                </IconButton>
              }
            >
              <Iconify
                icon={
                  completedSteps['template-created']
                    ? 'ic:outline-check-circle'
                    : 'ic:outline-circle'
                }
                sx={{
                  mr: 1,
                  width: 24,
                  height: 24,
                  color: completedSteps['template-created']
                    ? theme.palette.success.main
                    : theme.palette.divider,
                }}
              />
              <ListItemText
                primary="Add a Template"
                primaryTypographyProps={{ variant: 'subtitle1' }}
              />
            </ListItem>
          )}
          <ListItem
            sx={{
              padding: 2,
            }}
            secondaryAction={
              <IconButton onClick={() => navigate(PATH_DASHBOARD.clients.root)}>
                <Iconify icon="ic:baseline-chevron-right" />
              </IconButton>
            }
          >
            <Iconify
              icon={
                completedSteps['forms-created'] ? 'ic:outline-check-circle' : 'ic:outline-circle'
              }
              sx={{
                mr: 1,
                width: 24,
                height: 24,
                color: completedSteps['forms-created']
                  ? theme.palette.success.main
                  : theme.palette.divider,
              }}
            />
            <ListItemText primary="Send a Form" primaryTypographyProps={{ variant: 'subtitle1' }} />
          </ListItem>
        </Stack>
        <ListItem
          sx={{
            padding: 2,
          }}
          secondaryAction={
            <IconButton onClick={() => navigate(PATH_DASHBOARD.clients.new)}>
              <Iconify icon="ic:baseline-chevron-right" />
            </IconButton>
          }
        >
          <Iconify
            icon={
              completedSteps['client-created'] ? 'ic:outline-check-circle' : 'ic:outline-circle'
            }
            sx={{
              mr: 1,
              width: 24,
              height: 24,
              color: completedSteps['client-created']
                ? theme.palette.success.main
                : theme.palette.divider,
            }}
          />
          <ListItemText primary="Add a Client" primaryTypographyProps={{ variant: 'subtitle1' }} />
        </ListItem>

        {stepsCompleted === totalSteps && (
          <Button
            sx={{ mt: 2 }}
            onClick={() => {
              onClose();
              onComplete();
            }}
            variant="contained"
          >
            Complete Onboarding
          </Button>
        )}
      </Stack>
    </Dialog>
  );
}
