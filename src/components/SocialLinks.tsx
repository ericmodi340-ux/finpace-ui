// @mui
import { Stack, Card, TextField, InputAdornment, styled, Typography } from '@mui/material';
import Iconify from './Iconify';

// @types
const IconStyle = styled(Iconify)(({ theme }) => ({
  width: 30,
  height: 30,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    value: 'socialMedia.facebook',
    icon: <IconStyle icon="logos:facebook" />,
  },
  {
    value: 'socialMedia.instagram',
    icon: <IconStyle icon="skill-icons:instagram" />,
  },
  {
    value: 'socialMedia.linkedin',
    icon: <IconStyle icon="skill-icons:linkedin" />,
  },
  {
    value: 'socialMedia.twitter',
    icon: <IconStyle icon="logos:twitter" />,
  },
  {
    value: 'socialMedia.youtube',
    icon: <IconStyle icon="openmoji:youtube" />,
  },
] as const;

type socialLinkTypes = {
  getFieldProps: (key: string) => Object;
};

export default function SocialLinks({ getFieldProps }: socialLinkTypes) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography mb={2} variant="overline" sx={{ display: 'block', color: 'text.secondary' }}>
        Social Links
      </Typography>
      <Stack spacing={3} alignItems="flex-end">
        {SOCIAL_LINKS.map((link) => (
          <TextField
            key={link.value}
            fullWidth
            {...getFieldProps(link.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">{link.icon}</InputAdornment>,
            }}
          />
        ))}
      </Stack>
    </Card>
  );
}
