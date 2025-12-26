import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Button, Typography, StackProps, IconButton } from '@mui/material';
import Iconify from 'components/Iconify';
// components

// ----------------------------------------------------------------------

interface Props extends StackProps {
  title: string;
  subTitle?: string;
  link?: string;
  onOpen?: VoidFunction;
  collapse?: boolean;
  onCollapse?: VoidFunction;
  setOpen: (open: boolean) => void;
}

export default function NotesPanel({
  title,
  subTitle,
  link,
  onOpen,
  collapse,
  onCollapse,
  sx,
  setOpen,
  ...other
}: Props) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 3, ...sx }} {...other}>
      <Stack flexGrow={1}>
        <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
          <Typography variant="h6"> {title} </Typography>
          <IconButton size="medium" color="primary" onClick={() => setOpen(true)}>
            <Iconify icon="eva:plus-fill" />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
          {subTitle}
        </Typography>
      </Stack>

      {link && (
        <Button
          to={link}
          component={RouterLink}
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:chevron-right-fill" />}
        >
          View All
        </Button>
      )}

      {onCollapse && (
        <IconButton onClick={onCollapse}>
          <Iconify icon={collapse ? 'eva:chevron-down-fill' : 'eva:chevron-up-fill'} />
        </IconButton>
      )}
    </Stack>
  );
}
