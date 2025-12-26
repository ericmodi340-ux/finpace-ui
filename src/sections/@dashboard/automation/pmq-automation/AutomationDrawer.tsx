import {
  Avatar,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  Button,
} from '@mui/material';
import Iconify from 'components/Iconify';
import React, { useCallback } from 'react';

export const defaultDrawerWidth = 400;
const minDrawerWidth = 340;
const maxDrawerWidth = 800;

export default function AutomationDrawer() {
  const theme = useTheme();
  const [drawerWidth, setDrawerWidth] = React.useState(defaultDrawerWidth);

  const handleMouseDown = (e: any) => {
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseMove = useCallback((e: any) => {
    const newWidth = e.clientX - document.body.offsetLeft;
    if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth);
    }
  }, []);

  return (
    <Stack
      sx={{
        width: drawerWidth,
        position: 'relative',
        flexShrink: 0,
        borderRight: 1,
        borderColor: theme.palette.divider,
      }}
    >
      <IconButton
        sx={{
          position: 'absolute',
          top: 50,
          right: -15,
          background: theme.palette.background.paper,
          border: 1,
          borderColor: theme.palette.divider,
          cursor: 'ew-resize',
          zIndex: 100,
        }}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        <Iconify
          sx={{
            height: 15,
            width: 15,
          }}
          icon={'f7:resize-h'}
        />
      </IconButton>
      <Stack>
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="menu">
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar
              variant="rounded"
              sx={{
                background: theme.palette.common.white,
                border: 1,
                borderColor: theme.palette.divider,
              }}
            >
              <Iconify sx={{ width: 24, height: 24 }} icon={'eva:file-text-fill'} color="blue" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="PMQ + Calendly Automation"
            primaryTypographyProps={{
              variant: 'subtitle1',
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary="About this Automation"
            secondary="After an invitee schedules a meeting, you often want to send a form after meeting to easily stay in touch with them. With a little help from this integration, you can automatically send new Calendly invitees right over to Finpace without having to do any manual work yourself."
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <IconButton>
              <Iconify icon="icon-park-outline:down" color="#000" sx={{ height: 20, width: 20 }} />
            </IconButton>
          </ListItemIcon>
          <ListItemText
            primary="Calendly Invitee"
            primaryTypographyProps={{
              variant: 'subtitle1',
            }}
          />
        </ListItem>
        <Stack p={3}>
          <ListItem
            sx={{
              p: 2,
              border: 1,
              borderColor: theme.palette.grey[300],
            }}
            secondaryAction={
              <Button color="info" variant="outlined">
                Change
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                sx={{
                  background: theme.palette.common.white,
                  border: 1,
                  borderColor: theme.palette.divider,
                }}
              >
                <Iconify sx={{ width: 24, height: 24 }} icon={'eva:file-text-fill'} color="blue" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Calendly Invitee"
              primaryTypographyProps={{
                variant: 'subtitle1',
              }}
            />
          </ListItem>
        </Stack>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <IconButton>
              <Iconify icon="icon-park-outline:down" color="#000" sx={{ height: 20, width: 20 }} />
            </IconButton>
          </ListItemIcon>
          <ListItemText
            primary="Pre-Meeting Notes"
            primaryTypographyProps={{
              variant: 'subtitle1',
            }}
          />
        </ListItem>
      </Stack>
    </Stack>
  );
}
