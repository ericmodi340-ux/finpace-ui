import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Container, Stack } from '@mui/material';
// components
import { MotionContainer, varBounce } from 'components/animate';
import Logo from 'components/Logo';
import Page from 'components/Page';
// hooks
import useBrand from 'hooks/useBrand';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  justifyItems: 'center',
}));

// ----------------------------------------------------------------------

export default function EsignAccessDocuments() {
  const brand = useBrand();

  return (
    <MotionContainer sx={{ height: 1 }}>
      <Page title="Access Documents" sx={{ height: 1 }}>
        <RootStyle>
          <Container sx={{ flexGrow: 1, padding: 5, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
              <m.div variants={varBounce().in}>
                <Typography variant="h3" paragraph sx={{ mb: 4 }}>
                  Welcome to {brand.name || 'Finpace'}!
                </Typography>
              </m.div>
              <Typography variant="h5" paragraph>
                It looks like someone sent you documents.
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 4 }}>
                We use DocuSign for this. Please click the button below to be redirected to
                DocuSign, where you can access your documents using the code from your email.
              </Typography>

              <Button
                href="https://www.docusign.net/Member/authenticate.aspx"
                target="_blank"
                rel="noopener noreferrer"
                title="Access Documents on DocuSign"
                size="large"
                variant="contained"
              >
                Access Documents
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
