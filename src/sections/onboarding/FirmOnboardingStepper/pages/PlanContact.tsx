import { useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
// redux
import { useSelector } from 'redux/store';
// utils
import { hasActivePlan } from 'utils/firm';
// constants
import { emails } from 'constants/bitsy';

// ----------------------------------------------------------------------

export default function PlanContact({ onContinue }: { onContinue: VoidFunction }) {
  const theme = useTheme();
  const { firm } = useSelector((state) => state.firm);
  const firmHasActivePlan = hasActivePlan(firm);

  useEffect(() => {
    if (firmHasActivePlan) {
      onContinue();
    }
  }, [firmHasActivePlan, onContinue]);

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
          maxWidth: '960px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Button variant="contained" href={`mailto:${emails.SALES}`}>
          Contact Sales
        </Button>
      </Box>
    </Box>
  );
}
