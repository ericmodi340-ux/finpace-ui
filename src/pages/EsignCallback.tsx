import { useEffect } from 'react';
import { m } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Button, Typography, Container, Stack } from '@mui/material';
// redux
import { useSelector } from 'redux/store';
// components
import { MotionContainer, varBounce } from 'components/animate';
import Iconify from 'components/Iconify';
import LoadingScreen from 'components/LoadingScreen';
import Logo from 'components/Logo';
import Page from 'components/Page';
// utils
import { getParams } from 'utils/params';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  justifyItems: 'center',
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  flexGrow: 0,
  width: 120,
  height: 120,
  borderRadius: '50%',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function EsignCallback() {
  const theme = useTheme();
  const { firm } = useSelector((state) => state.firm);
  const { signerId, emailFlow, failure, event, roleName, deliveryMethod, ...params } = getParams();

  const isEmailFlow = emailFlow === 'true' || deliveryMethod === 'email';
  const isFailure =
    failure === 'true' || // failed id verification questions
    event === 'cancel' || // clicked "finish later"
    event === 'id_check_failed' || // DocuSign Authentication failed
    event === 'session_timeout'; // signing session timed out
  const isSignNowFlow = !isEmailFlow && !isFailure;

  useEffect(() => {
    const timer = setTimeout(() => {
      const msg = JSON.stringify({
        firmID: params.firmId,
        email: params.email,
        signerId: roleName,
        event,
      });
      if (isSignNowFlow && window && window.opener) {
        console.log('Sending a message to parent window.', msg);
        window.opener.postMessage(msg);
      }
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isSignNowFlow) {
    return (
      <MotionContainer sx={{ height: 1 }}>
        <Page title="Esign Success" sx={{ height: 1 }}>
          <LoadingScreen
            message="We have successfully captured your signature, please wait for the window to auto-close."
            maxWidth="360px"
          />
        </Page>
      </MotionContainer>
    );
  }

  if (event === 'decline') {
    return (
      <MotionContainer sx={{ height: 1 }}>
        <Page title="Esign Success" sx={{ height: 1 }}>
          <LoadingScreen
            message="You have declined to sign, envelope has been marked as voided, please wait for the window to auto-close."
            maxWidth="360px"
          />
        </Page>
      </MotionContainer>
    );
  }

  let scenario = '';
  if (isEmailFlow) {
    scenario = 'email_flow';
  } else if (isFailure) {
    scenario = event || 'failure';
  }

  const copyScenarios: { [key: string]: { icon: string; headline: string; message: string } } = {
    EMAIL_FLOW: {
      icon: 'fa:thumbs-up',
      headline: firm?.name
        ? `${signerId === 'firm' || roleName === 'firm' ? 'Hi,' : 'Welcome to'} ${firm.name}!`
        : "You're all set!",
      message:
        signerId === 'firm' || roleName === 'firm'
          ? 'The client is finalized. We are now generating final versions of signed documents and will email them to all parties.'
          : "Signing was successful. You'll receive an email with the final documents once all parties have signed.",
    },
    CANCEL: {
      icon: 'mdi:hand-wave',
      headline: 'See you later!',
      message:
        'You can try signing again from the link in your email or contact your advisor with any questions.',
    },
    ID_CHECK_FAILED: {
      icon: 'mdi:hand-wave',
      headline: 'The DocuSign Authentication failed!',
      message: 'The DocuSign authentication failed, please try again.',
    },
    SESSION_TIMEOUT: {
      icon: 'eva:clock-fill',
      headline: 'Session timed out',
      message: 'Please try again from the link in your email.',
    },
    FAILURE: {
      icon: 'fa6-solid:exclamation',
      headline: 'Something went wrong',
      message: 'Please contact your advisor for next steps.',
    },
  };

  const copyScenario = copyScenarios[scenario.toUpperCase()] || {};
  const { icon, headline, message } = copyScenario;

  return (
    <MotionContainer sx={{ height: 1 }}>
      <Page title="Esign" sx={{ height: 1 }}>
        <RootStyle>
          <Container sx={{ flexGrow: 1, padding: 5, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
              <m.div variants={varBounce().in}>
                <IconWrapperStyle
                  sx={{
                    backgroundColor: isFailure
                      ? theme.palette.error.main
                      : theme.palette.primary.main,
                  }}
                >
                  <Iconify
                    icon={icon || 'eva:question-mark-fill'}
                    width={76}
                    height={76}
                    color={theme.palette.common.white}
                  />
                </IconWrapperStyle>
              </m.div>

              <m.div variants={varBounce().in}>
                <Typography variant="h3" paragraph sx={{ mb: 4 }}>
                  {headline || 'Something happened!'}
                </Typography>
              </m.div>
              <Typography sx={{ color: 'text.secondary', mb: 4 }}>
                {message || "But we don't know exactly what. Please contact Finpace."}
              </Typography>

              <Button
                to={PATH_DASHBOARD.auth.login}
                title="Go to your dashboard"
                size="large"
                variant="contained"
                component={RouterLink}
                sx={{ textTransform: 'none' }}
              >
                Go to your dashboard
              </Button>
            </Box>
          </Container>

          <Box sx={{ p: 3, flexGrow: 0, justifySelf: 'flex-end' }}>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Powered by{' '}
              </Typography>
              <Logo branded={false} sx={{ width: '60px', height: 'auto' }} />
            </Stack>
          </Box>
        </RootStyle>
      </Page>
    </MotionContainer>
  );
}
