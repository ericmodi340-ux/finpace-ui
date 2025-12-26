// @mui
import { SxProps, Tooltip, TooltipProps, IconButton } from '@mui/material';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

interface Props extends Omit<TooltipProps, 'children'> {
  sx?: SxProps;
}

export default function Tip({ title, sx, ...other }: Props) {
  return (
    <Tooltip title={title} sx={{ ...sx, cursor: 'help' }} {...other}>
      <IconButton aria-label="tip" type="button" onClick={() => null}>
        <Iconify width={24} height={24} icon="eva:question-mark-circle-fill" />
      </IconButton>
    </Tooltip>
  );
}
