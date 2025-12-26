// @mui
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Dialog, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
// components
import { UserRole } from '../@types/user';
import { UploadAvatar } from './upload';
import useStorage from 'hooks/useStorage';
import { getImagePath } from 'utils/storage';
import { roles } from 'constants/users';
import { useCallback, useState } from 'react';
import { AVATAR_MAX_SIZE } from 'config';
import { createStorageItem, deleteStorageItem, getStorageItem, setUrl } from 'redux/slices/storage';
import { sentenceCase } from 'change-case';
import { validateMime } from 'utils/files';
import { useDispatch } from 'redux/store';
import { useSnackbar } from 'notistack';
import useUser from 'hooks/useUser';
import Iconify from './Iconify';
import { useBoolean } from 'hooks/useBoolean';
import CalendarForm from 'sections/@dashboard/calendar/CalendarForm';
import { CALENDAR_COLOR_OPTIONS } from 'sections/@dashboard/calendar/styles';
import ClientSettings from 'sections/@dashboard/client/profile/ClientSettings';

// ----------------------------------------------------------------------

export const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(19),
  },
}));

// ----------------------------------------------------------------------

type ProfileCoverProps = {
  name: string;
  id: string;
  advisorName: string;
  isProspect?: boolean;
  currentClient?: any;
};

export default function ProfileCoverClient({
  name,
  advisorName,
  id,
  isProspect,
  currentClient,
}: ProfileCoverProps) {
  const { authUser } = useUser();
  const defaultAvatarPath = getImagePath({
    userType: roles.CLIENT as UserRole.CLIENT,
    userId: id,
    imageType: 'avatar',
  });
  const [avatarPath, setAvatarPath] = useState(defaultAvatarPath);
  const { url: avatarUrl } = useStorage({ path: avatarPath });
  const opencreateTasks = useBoolean();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const openSettings = useBoolean();

  const theme = useTheme();

  const handleDropSingleFile = useCallback(
    (fieldId: any, acceptedFiles: any) => {
      const uploadFile = async (fieldId: string, path: string, file: File) => {
        const cb = async (isValid: boolean) => {
          try {
            if (!isValid) throw new Error('Invalid file type');
            await createStorageItem({ path, file });

            // Force rerender of useStorage() hooks
            switch (fieldId) {
              case 'avatar':
                setAvatarPath('');
                setAvatarPath(defaultAvatarPath);
                break;
              default:
                break;
            }
            const newUrl = await getStorageItem({ path: path, isPublic: true });
            dispatch(setUrl({ path: path, url: newUrl }));
            enqueueSnackbar(`${sentenceCase(fieldId)} uploaded successfully`, {
              variant: 'success',
            });
          } catch (err: any) {
            console.error(`Error uploading ${fieldId}`, err);
            enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
          }
        };
        validateMime(file, cb);
      };

      let newFiles: File[] = [];

      newFiles = acceptedFiles.map((acceptedFile: File) =>
        Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        })
      );

      if (newFiles.length) {
        const file = newFiles[0];
        uploadFile(
          fieldId,
          getImagePath({
            userType: roles.CLIENT as UserRole.CLIENT,
            userId: id,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    [id, defaultAvatarPath, dispatch, enqueueSnackbar]
  );

  const handleDeleteSingleFile = async (fieldId: string, path: string | undefined) => {
    if (!path) {
      return;
    }

    try {
      await deleteStorageItem({ path });

      // Force refresh of useStorage() hooks
      switch (fieldId) {
        case 'avatar':
          setAvatarPath('');
          break;
        default:
          break;
      }

      enqueueSnackbar(`${sentenceCase(fieldId)} deleted successfully`, { variant: 'success' });
    } catch (err) {
      console.error(`Error deleting ${fieldId}`, err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <Stack
      sx={{
        backgroundColor: alpha(theme.palette.primary.darker, 0.8),
        color: (theme) => theme.palette.getContrastText(theme.palette.primary.dark),
        py: 2,
        px: 3,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <UploadAvatar
            hasTitle={false}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
            file={avatarUrl}
            maxFiles={1}
            maxSize={AVATAR_MAX_SIZE}
            sx={{
              padding: 0,
              width: '80px !important',
              height: '80px !important',
            }}
            onDrop={(files) => handleDropSingleFile('avatar', files)}
            // onDelete={() => handleDeleteSingleFile('avatar', avatarPath)}
          />
          <Stack>
            <Stack alignItems="center" flexDirection="row">
              <Typography variant="h4">{name}</Typography>
              {isProspect && (
                <Typography sx={{ textTransform: 'capitalize', ml: 1 }}>(P)</Typography>
              )}
            </Stack>

            {authUser?.role === roles.FIRM_ADMIN && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>
                  <span
                    style={{
                      opacity: 0.72,
                      marginRight: 8,
                    }}
                  >
                    Advisor:
                  </span>
                  {advisorName}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2}>
          {/* <StyledIconButton label="Add Task" icon="mdi:task-add" onClick={opencreateTasks.onTrue} /> */}
          {/* <StyledIconButton label="Add Note" icon="mdi:note-add-outline" onClick={() => null} /> */}

          <StyledIconButton
            label="Edit Settings"
            icon="mdi:settings-outline"
            onClick={openSettings.onTrue}
          />
        </Stack>
      </Stack>

      {openSettings.value && (
        <ClientSettings
          currentClient={currentClient}
          open={openSettings.value}
          onClose={openSettings.onFalse}
        />
      )}

      {opencreateTasks.value && (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={opencreateTasks.value}
          onClose={opencreateTasks.onFalse}
        >
          <DialogTitle sx={{ minHeight: 76 }}>Add Tasks</DialogTitle>

          <CalendarForm
            currentEvent={{
              id: '',
              title: '',
              description: '',
              color: CALENDAR_COLOR_OPTIONS[1],
              allDay: false,
              start: new Date().getTime(),
              end: new Date().getTime(),
              client: {
                email: '',
                id: '',
                name: '',
              },
              category: '',
              type: '',
            }}
            colorOptions={CALENDAR_COLOR_OPTIONS}
            onClose={opencreateTasks.onFalse}
            userId={id}
          />
        </Dialog>
      )}
    </Stack>
  );
}

const StyledIconButton = ({
  icon,
  onClick,
  label,
}: {
  icon: string;
  onClick: () => void;
  label: string;
}) => (
  <Stack onClick={onClick} alignItems="center" spacing={1}>
    <IconButton
      onClick={onClick}
      size="small"
      sx={{
        backgroundColor: (theme) => theme.palette.getContrastText(theme.palette.primary.dark),
        ':hover': {
          backgroundColor: (theme) => theme.palette.getContrastText(theme.palette.primary.dark),
        },
        color: (theme) => alpha(theme.palette.primary.dark, 0.8),
      }}
    >
      <Iconify icon={icon} />
    </IconButton>
    <Typography variant="caption">{label}</Typography>
  </Stack>
);
