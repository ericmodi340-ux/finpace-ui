// @mui
import Stack from '@mui/material/Stack';
import { Card } from '@mui/material';
import LogoIcon from 'components/LogoIcon';

// ----------------------------------------------------------------------

type Props = {
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children }: Props) {
  const renderContent = (
    <Card
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 430,
        px: { xs: 2, md: 4 },
        my: 'auto',
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack sx={{ mb: 3 }} alignItems="center" justifyContent="center" spacing={2}>
        <LogoIcon height={70} width="auto" />
      </Stack>
      {children}
    </Card>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.neutral,
      }}
    >
      {renderContent}
    </Stack>
  );
}
