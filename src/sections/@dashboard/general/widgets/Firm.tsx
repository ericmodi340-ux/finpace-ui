// @mui
import {
  Box,
  Card,
  Stack,
  Avatar,
  Tooltip,
  Typography,
  CardHeader,
  IconButton,
} from '@mui/material';
// @types
import { FirmManager } from '../../../../@types/firm';
// components
import CalendarButton from 'components/CalendarButton';
import Iconify from 'components/Iconify';
// hooks
import useStorage from 'hooks/useStorage';
// utils
import { getImagePath } from 'utils/storage';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  subheader?: string;
  firm: FirmManager;
};

export default function Firm({ title, subheader, firm }: Props) {
  const calendarUrl = firm.settings?.calendar?.url;

  const iconPath = getImagePath({ userType: 'firm', userId: firm.id, imageType: 'icon' });
  const logoPath = getImagePath({ userType: 'firm', userId: firm.id, imageType: 'logo' });
  const { url: iconUrl } = useStorage({ path: iconPath });
  const { url: logoUrl } = useStorage({ path: logoPath });

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" key={firm.id}>
          <Avatar src={iconUrl || logoUrl} sx={{ width: 48, height: 48 }} />
          <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
              {firm.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {firm.email}
            </Typography>
          </Box>

          {firm.email && (
            <Tooltip title={`Email ${firm.name || 'this firm'}`}>
              <IconButton size="small" href={`mailto:${firm.email}`}>
                <Iconify icon={'eva:email-fill'} width={22} height={22} />
              </IconButton>
            </Tooltip>
          )}

          {calendarUrl && (
            <Tooltip title={`Schedule a meeting with ${firm.name || 'this firm'}`}>
              <div>
                <CalendarButton url={calendarUrl} iconButton size="small" />
              </div>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
