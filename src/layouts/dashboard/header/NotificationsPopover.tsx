import { isEqual } from 'lodash';
import { useRef, useState, useEffect, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

// @mui
import {
  Box,
  List,
  Badge,
  Avatar,
  Button,
  Divider,
  Typography,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  ListItemButton,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
// @types
import {
  NotificationsState,
  NotificationManager,
  NotificationType,
} from '../../../@types/notification';
import { FormReviewer } from '../../../@types/form';
// redux
import { useSelector, RootState } from 'redux/store';
import { updateNotification } from 'redux/slices/notifications';
// components
import Iconify from 'components/Iconify';
import Scrollbar from 'components/Scrollbar';
import MenuPopover from 'components/MenuPopover';
// hooks
// utils
import arrayFromObj from 'utils/arrayFromObj';
import { fToNow } from 'utils/formatTime';
// constants
import { notificationTypes } from 'constants/notifications';
import { arrayInChunks } from 'utils/arrays';
import Label from 'components/Label';
import { PATH_DASHBOARD } from 'routes/paths';
import { UserRole } from '../../../@types/user';

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const anchorRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [notificationsThisWeek, setNotificationsThisWeek] = useState<NotificationManager[]>([]);
  const [notificationsLastWeek, setNotificationsLastWeek] = useState<NotificationManager[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationsFromStore = useSelector(
    (state: RootState) => state.notifications
  ) as NotificationsState;
  const notifications = arrayFromObj(
    notificationsFromStore.byId,
    notificationsFromStore.allIds
  ) as NotificationManager[];
  const filteredNotifications = notifications.filter((notification) =>
    [
      notificationTypes.FORM_ASSIGNED as NotificationType,
      notificationTypes.SIGNER_SIGNED as NotificationType,
      notificationTypes.ENVELOPE_COMPLETED as NotificationType,
      notificationTypes.ENVELOPE_DECLINED as NotificationType,
      notificationTypes.ENVELOPE_CANCELLED as NotificationType,
      notificationTypes.FORM_COMPLETED as NotificationType,
      notificationTypes.FORM_CANCELLED as NotificationType,
    ].includes(notification.notificationType)
  );
  const sortedNotifications = filteredNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const notificationsUnread = sortedNotifications.filter(
    (notification) => notification.read !== true
  );

  const totalUnread = notificationsUnread.length;

  useEffect(() => {
    const newThisWeek = notificationsUnread.filter(
      (notification) =>
        differenceInDays(new Date().getTime(), new Date(notification.createdAt).getTime()) <= 7
    );

    const newLastWeek = notificationsUnread.filter((notification) => {
      const diff = differenceInDays(
        new Date().getTime(),
        new Date(notification.createdAt).getTime()
      );
      return diff > 7;
    });

    if (!isEqual(notificationsThisWeek, newThisWeek)) {
      setNotificationsThisWeek(newThisWeek);
    }

    if (!isEqual(notificationsLastWeek, newLastWeek)) {
      setNotificationsLastWeek(newLastWeek);
    }
  }, [
    filteredNotifications,
    sortedNotifications,
    notificationsThisWeek,
    notificationsLastWeek,
    notificationsUnread,
  ]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReadAll = async () => {
    await filterAndUpdateNotifications(notificationsUnread, true);
  };

  const filterAndUpdateNotifications = async (notifications: Array<any>, read: boolean) => {
    setLoading(true);
    let _notifications = notifications;
    // run batch endpoint if there are more than 100 notifications
    if (_notifications.length > 100) {
      await Promise.all(
        arrayInChunks(_notifications, 100).map(async (notificationsChunk) => {
          await toggleAllReadAndUnreadAPI(notificationsChunk, read);
        })
      );
    } else {
      await toggleAllReadAndUnreadAPI(_notifications, read);
    }
    setLoading(false);
  };

  const toggleAllReadAndUnreadAPI = async (notifications: Array<any>, read: boolean) => {
    try {
      await updateNotification(
        notifications.map((notification) => notification.id),
        { read: read }
      );
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        size="large"
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
      >
        <Badge badgeContent={totalUnread} color="primary">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 400 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pt: 2,
            px: 2.5,
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1">Notifications</Typography>
          {totalUnread > 0 && (
            <Button variant="outlined" size="small" onClick={handleReadAll}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Tabs
          value="all"
          sx={{
            px: 2.8,
          }}
        >
          <Tab
            value="all"
            label="All"
            iconPosition="end"
            icon={
              <Label variant="ghost" sx={{ ml: 1 }}>
                {totalUnread}
              </Label>
            }
          />
        </Tabs>

        <Divider />
        <Stack sx={{ height: { xs: 340 } }}>
          <Scrollbar>
            {!!sortedNotifications.length ? (
              <NotificationList handleClose={handleClose} notifications={sortedNotifications} />
            ) : (
              <ListItem
                sx={{
                  py: 3,
                  px: 2.5,
                  mt: '1px',
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      No notifications yet!
                    </Typography>
                  }
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            )}
            {/* {!!notificationsLastWeek.length && !!notificationsThisWeek.length && showAll && (
              <NotificationList
                handleClose={handleClose}
                label="Last Week"
                notifications={notificationsLastWeek}
              />
            )} */}
          </Scrollbar>
        </Stack>

        {/* {!!notificationsLastWeek.length && !!notificationsThisWeek.length && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button fullWidth disableRipple onClick={() => setShowAll(!showAll)}>
                View {showAll ? 'less' : 'more'}
              </Button>
            </Box>
          </>
        )} */}
      </MenuPopover>
    </>
  );
}
function NotificationList({
  notifications,
  handleClose,
}: {
  notifications: NotificationManager[];
  handleClose: VoidFunction;
}) {
  return (
    <List disablePadding>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          handleClose={handleClose}
        />
      ))}
    </List>
  );
}

function NotificationItem({
  notification,
  handleClose,
}: {
  notification: NotificationManager;
  handleClose: VoidFunction;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const { notificationText, notificationType, payload } = notification;
  const navigate = useNavigate();

  let clientName;

  if (notificationType.startsWith('ENVELOPE_')) {
    clientName = '';
    if (payload?.envelope?.recipients?.client_1) {
      clientName += payload?.envelope?.recipients?.client_1.name;
    }
    if (payload?.envelope?.recipients?.client_2) {
      clientName += ` & ${payload?.envelope?.recipients?.client_2.name}`;
    }
  }

  if (notificationType.startsWith('FORM_')) {
    clientName = '';
    if (payload?.envelope?.recipients?.client_1) {
      clientName += payload?.envelope?.recipients?.client_1.name;
    }
    if (payload?.envelope?.recipients?.client_2) {
      clientName += ` & ${payload?.envelope?.recipients?.client_2.name}`;
    }
  }

  if (notificationType.startsWith('REVIEWER_')) {
    clientName = '';
    const clientReviewer = payload?.originalItem?.reviewers?.find(
      (reviewer: FormReviewer) =>
        reviewer.id === payload?.originalItem?.clientId && reviewer.type === 'client'
    );
    if (clientReviewer) {
      clientName = clientReviewer.name;
    }
  }

  if (clientName) {
    clientName += `'s`;
  }

  let titleMain;
  let titleSub;
  let onClick;
  switch (notificationType) {
    case notificationTypes.FORM_ASSIGNED:
      titleMain = notificationText || 'A form has been assigned to you';
      titleSub = '';
      onClick = () => {
        if (notification.userType === UserRole.CLIENT) {
          navigate(PATH_DASHBOARD.forms.root + `/${payload?.form?.id}`);
        }
        if (
          notification.userType === UserRole.FIRM_ADMIN ||
          notification.userType === UserRole.ADVISOR
        ) {
          navigate(PATH_DASHBOARD.clients.root + `/${notification?.clientId}?t=forms_documents`);
        }
      };
      break;
    default:
      titleMain = notificationText || 'Something happened:';
      titleSub = notificationText ? '' : notificationType;
      onClick = () => null;
    // case notificationTypes.SIGNER_SIGNED:
    //   titleMain = payload?.name || payload?.email || 'A signer';
    //   titleSub = `has signed ${currentUserIsClient ? 'your' : clientName || 'a'} ${
    //     templateTitle || 'document'
    //   }`;
    //   avatarIcon = 'ri:quill-pen-fill';
    //   break;
    // case notificationTypes.ENVELOPE_CREATED:
    // case notificationTypes.ENVELOPE_COMPLETED:
    // case notificationTypes.ENVELOPE_DECLINED:
    // case notificationTypes.ENVELOPE_CANCELLED:
    //   titleMain = `${currentUserIsClient ? 'Your' : clientName || 'A'} ${
    //     templateTitle || 'document'
    //   }`;
    //   titleSub = `has been ${noCase(notificationType.replace('ENVELOPE_', ''))}`;

    //   if (notificationType === notificationTypes.ENVELOPE_CREATED) {
    //     avatarIcon = 'teenyicons:file-plus-solid';
    //   } else if (notificationType === notificationTypes.ENVELOPE_COMPLETED) {
    //     avatarIcon = 'teenyicons:file-tick-solid';
    //   } else if (notificationType === notificationTypes.ENVELOPE_DECLINED) {
    //     avatarIcon = 'teenyicons:file-no-access-solid';
    //   } else if (notificationType === notificationTypes.ENVELOPE_CANCELLED) {
    //     avatarIcon = 'teenyicons:file-x-solid';
    //   } else {
    //     avatarIcon = 'teenyicons:file-solid';
    //   }
    //   break;
    // case notificationTypes.FORM_COMPLETED:
    // case notificationTypes.FORM_CANCELLED:
    //   titleMain = `${currentUserIsClient ? 'Your' : clientName || 'A'} ${
    //     templateTitle ? `${templateTitle} ` : ''
    //   }form`;
    //   titleSub = `has been ${noCase(
    //     notificationType.replace('FORM_', '').replace('REVIEWER_', '')
    //   )}`;

    //   if (notificationType === notificationTypes.FORM_ASSIGNED) {
    //     avatarIcon = 'teenyicons:clipboard-plus-solid';
    //   } else if (notificationType === notificationTypes.FORM_COMPLETED) {
    //     avatarIcon = 'teenyicons:clipboard-tick-solid';
    //   } else if (notificationType === notificationTypes.FORM_CANCELLED) {
    //     avatarIcon = 'teenyicons:clipboard-x-solid';
    //   } else {
    //     avatarIcon = 'teenyicons:clipboard-solid';
    //   }
    //   break;
    // default:
    //   titleMain = notificationText || 'Something happened:';
    //   titleSub = notificationText ? '' : notificationType;
    //   avatarIcon = 'teenyicons:info-circle-solid';
    //   break;
  }

  const readNotification = useCallback(async () => {
    if (!notification.read) {
      try {
        await updateNotification([notification.id], { read: true });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, notification.id, notification.read]);

  // useEffect(() => {
  //   if (notification.read) return;

  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       if (entry.isIntersecting) {
  //         readNotification();
  //         observer.disconnect();
  //       }
  //     },
  //     { threshold: 1 }
  //   );

  //   if (itemRef.current) {
  //     observer.observe(itemRef.current);
  //   }

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [notification.read, readNotification]);

  return (
    <ListItem
      sx={{
        p: 0,
        mt: '1px',
        ...(!notification.read && {
          background: (theme) => theme.palette.grey[200],
        }),
      }}
      // secondaryAction={
      //   <Tooltip title={`Mark as ${notification.read ? 'unread' : 'read'}`}>
      //     <IconButton
      //       edge="end"
      //       aria-label={`mark as ${notification.read ? 'unread' : 'read'}`}
      //       onClick={handleToggleRead}
      //     >
      //       <Iconify
      //         icon={
      //           notification.read
      //             ? 'mdi:checkbox-marked-circle'
      //             : 'mdi:checkbox-blank-circle-outline'
      //         }
      //       />
      //     </IconButton>
      //   </Tooltip>
      // }
    >
      <ListItemButton
        onClick={() => {
          readNotification();
          onClick();
          handleClose();
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              color: 'white',
              backgroundColor: 'primary.main',
            }}
          >
            TA
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle2">
              {titleMain}
              {titleSub && (
                <Typography component="span" variant="body2">
                  &nbsp;{titleSub}.
                </Typography>
              )}
            </Typography>
          }
          secondary={
            <Stack
              sx={{
                mt: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} /> */}
                {fToNow(notification.createdAt)}
              </Typography>
            </Stack>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
