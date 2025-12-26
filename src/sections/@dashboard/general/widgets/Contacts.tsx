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
import { AdvisorManager } from '../../../../@types/advisor';
import { ClientManager } from '../../../../@types/client';
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { UserRole } from '../../../../@types/user';
// components
import CalendarButton from 'components/CalendarButton';
import Iconify from 'components/Iconify';
import UserAvatar from 'components/UserAvatar';

// ----------------------------------------------------------------------

export interface FirmAdminContact extends FirmAdminManager {
  type: UserRole;
}

export interface AdvisorContact extends AdvisorManager {
  type: UserRole;
}

export interface ClientContact extends ClientManager {
  type: UserRole;
}

type Props = {
  title: string;
  subheader?: string;
  contacts: Array<FirmAdminContact | AdvisorContact | ClientContact | null>;
};

export default function Contacts({ title, subheader, contacts }: Props) {
  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={3} sx={{ p: 3 }}>
        {contacts.map((contact, idx) => {
          if (contacts.length === 1 && !contact) {
            return (
              <Stack direction="row" alignItems="center" key={`none-${idx}`}>
                <Avatar sx={{ width: 48, height: 48 }} />
                <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    None yet!
                  </Typography>
                </Box>
              </Stack>
            );
          }

          if (!contact) {
            return '';
          }

          const { type, id, name } = contact;
          // @ts-ignore
          const calendarUrl = contact.settings?.calendar?.url;

          return (
            <Stack direction="row" alignItems="center" key={`${contact.id}-${idx}`}>
              <UserAvatar user={{ type, id, name }} sx={{ width: 48, height: 48 }} />
              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                  {contact.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {contact.email}
                </Typography>
              </Box>

              {contact.email && (
                <Tooltip title={`Email ${contact.name || 'this person'}`}>
                  <IconButton size="small" href={`mailto:${contact.email}`}>
                    <Iconify icon={'eva:email-fill'} width={22} height={22} />
                  </IconButton>
                </Tooltip>
              )}

              {calendarUrl && (
                <Tooltip title={`Schedule a meeting with ${contact.name || 'this person'}`}>
                  <div>
                    <CalendarButton url={calendarUrl} iconButton size="small" />
                  </div>
                </Tooltip>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}
