// @mui
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Stack,
  Container,
  Typography,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
// hooks
import useCountdown from '../hooks/useCountdown';
// components
import Page from '../components/Page';
import SocialsButton from '../components/SocialsButton';
// assets
import { ComingSoonIllustration } from '../assets';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

const CountdownStyle = styled('div')({
  display: 'flex',
  justifyContent: 'center',
});

const SeparatorStyle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    margin: theme.spacing(0, 2.5),
  },
}));

// ----------------------------------------------------------------------
type ComingSoonProps = {
  countdownDate?: Date;
  allowEmailNotify?: boolean;
  showSocials?: boolean;
};

export default function ComingSoon({
  countdownDate,
  allowEmailNotify = false,
  showSocials = false,
}: ComingSoonProps) {
  const countdown = useCountdown(countdownDate);

  return (
    <Page title="Coming Soon" sx={{ height: 1 }}>
      <RootStyle>
        <Container>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h3" paragraph>
              Coming Soon!
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              We are currently working hard on this page!
            </Typography>

            <ComingSoonIllustration sx={{ my: 10, height: 240 }} />

            {countdown && (
              <CountdownStyle>
                <div>
                  <Typography variant="h2">{countdown.days}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Days</Typography>
                </div>

                <SeparatorStyle variant="h2">:</SeparatorStyle>

                <div>
                  <Typography variant="h2">{countdown.hours}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Hours</Typography>
                </div>

                <SeparatorStyle variant="h2">:</SeparatorStyle>

                <div>
                  <Typography variant="h2">{countdown.minutes}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Minutes</Typography>
                </div>

                <SeparatorStyle variant="h2">:</SeparatorStyle>

                <div>
                  <Typography variant="h2">{countdown.seconds}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Seconds</Typography>
                </div>
              </CountdownStyle>
            )}

            {allowEmailNotify && (
              <OutlinedInput
                fullWidth
                placeholder="Enter your email"
                endAdornment={
                  <InputAdornment position="end">
                    <Button variant="contained" size="large">
                      Notify Me
                    </Button>
                  </InputAdornment>
                }
                sx={{
                  my: 5,
                  pr: 0.5,
                  transition: (theme) =>
                    theme.transitions.create('box-shadow', {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.shorter,
                    }),
                  '&.Mui-focused': {
                    boxShadow: (theme) => theme.customShadows.z8,
                  },
                  '& fieldset': {
                    borderWidth: `1px !important`,
                    borderColor: (theme) => `${theme.palette.grey[500_32]} !important`,
                  },
                }}
              />
            )}

            {showSocials && (
              <Stack alignItems="center">
                <SocialsButton size="large" initialColor />
              </Stack>
            )}
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
