import { Box, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  src: string;
}

export default function SvgIconStyle({ src, sx }: Props) {
  return (
    <Box
      component="img"
      src={src}
      sx={{
        width: 24,
        height: 24,
        display: 'inline-block',
        ...sx,
      }}
    />
  );
}
