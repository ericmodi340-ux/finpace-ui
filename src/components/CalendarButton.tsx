// @mui
import { Button, IconButton } from '@mui/material';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

interface Props {
  url: string | undefined;
  text?: string | undefined;
  iconButton?: boolean;
  size?: 'small' | 'medium' | 'large' | undefined;
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | undefined;
}

export default function CalendarButton({
  url,
  text = 'Schedule Meeting',
  iconButton = false,
  size,
  color,
}: Props) {
  if (!url) {
    return <></>;
  }

  if (iconButton) {
    return (
      <IconButton href={url} target="_blank" size={size}>
        <Iconify icon={'eva:calendar-fill'} width={22} height={22} />
      </IconButton>
    );
  }

  return (
    <Button href={url} target="_blank" color={color} sx={{ textTransform: 'none' }}>
      {text}
    </Button>
  );
}
