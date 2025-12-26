// @mui
import { Card, Stack, Typography, Divider } from '@mui/material';
// utils
import { fNumber } from '../utils/formatNumber';

type ProfileFollowInfoProps = {
  totalClients?: number;
  totalAUM: number;
  clientSince?: number;
};

export default function ProfileFollowInfo({
  totalClients,
  totalAUM,
  clientSince,
}: ProfileFollowInfoProps) {
  return (
    <Card sx={{ py: 3, marginBottom: '1rem' }}>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
        <Stack width={1} textAlign="center">
          <Typography variant="h4">{clientSince ? clientSince : totalClients}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {clientSince ? 'Client Since' : 'Clients'}
          </Typography>
        </Stack>

        <Stack width={1} textAlign="center">
          <Typography variant="h4">{`$ ${fNumber(totalAUM)}`}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            AUM
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
