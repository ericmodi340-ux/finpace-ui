import { Box, Card, Grid, Typography } from '@mui/material';
import Label from 'components/Label';
import LogoIcon from 'components/LogoIcon';
import { useState } from 'react';
import { Notes, CreateNotesFormModal } from 'sections/@dashboard/notes';
import { ClientManager } from '../../../../@types/client';
import { useSelector } from 'redux/store';
import useUserFromStore from 'hooks/useUserFromStore';
import { roles } from 'constants/users';
import { UserRole } from '../../../../@types/user';
import { AdvisorManager } from '../../../../@types/advisor';
import { getClientCompositeName } from 'utils/clients';
import { fDateTime } from 'utils/formatTime';

type Props = {
  currentClient: ClientManager;
  clientId: string;
};

const ClientNotes = ({ currentClient, clientId }: Props) => {
  const { firm } = useSelector((state) => state.firm);

  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState('Case Notes');

  const advisor = useUserFromStore(
    currentClient?.advisorId,
    roles.ADVISOR as UserRole.ADVISOR
  ) as AdvisorManager;

  const clientName = getClientCompositeName(currentClient);

  const firmDetails = [
    { label: firm.name },
    { label: `Advisor: ${advisor?.name || 'No Advisor'}` },
    { label: `Advisor Phone: ${advisor?.phoneNumber || 'No phone available'}` },
  ];
  const clientDetails = [
    { label: clientName },
    { label: `Address: ${currentClient.address || 'No address available'}` },
    { label: `Phone: ${currentClient.phoneNumber || 'No phone available'}` },
  ];

  // TODO:
  // Define client IGO and NIGO to show tag accordingly
  return (
    <div>
      <Card sx={{ py: 5, px: 5 }}>
        <Grid container>
          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <LogoIcon
              sx={{
                width: 50,
                height: 50,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Label color="success" sx={{ textTransform: 'uppercase', mb: 1 }}>
                IGO
              </Label>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.primary' }}>
              Firm Details
            </Typography>
            {firmDetails.map((detail) => (
              <Typography key={detail.label} variant="body2" sx={{ color: 'text.secondary' }}>
                {detail.label}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.primary' }}>
              Client details
            </Typography>
            {clientDetails.map((detail) => (
              <Typography key={detail.label} variant="body2" sx={{ color: 'text.secondary' }}>
                {detail.label}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.primary' }}>
              Date updated
            </Typography>
            <Typography variant="body2">
              {currentClient?.updatedAt
                ? fDateTime(currentClient.updatedAt!!)
                : fDateTime(currentClient?.createdAt)}
            </Typography>
          </Grid>
        </Grid>
        <Notes folder={folder} setFolder={setFolder} setOpen={setOpen} clientId={clientId} />
        <CreateNotesFormModal folder={folder} open={open} setOpen={setOpen} clientId={clientId} />
      </Card>
    </div>
  );
};

export default ClientNotes;
