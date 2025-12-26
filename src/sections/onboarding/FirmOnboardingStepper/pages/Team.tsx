// @mui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
// components
import TeamInviteForm from 'sections/@dashboard/team/TeamInviteForm';

// ----------------------------------------------------------------------

export default function Team({ onContinue }: { onContinue: VoidFunction }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: `calc(100vw - ${theme.spacing(3)} * 2)`,
        position: 'relative',
        left: `calc(-50vw + ${theme.spacing(3)} + 50%)`,
        mt: 3,
        mb: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <TeamInviteForm onComplete={onContinue} />
      </Box>
    </Box>
  );
}
