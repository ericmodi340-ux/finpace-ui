// @mui
import { Container, Typography, Tooltip, Stack, IconButton } from '@mui/material';
// hooks
// components
import Page from 'components/Page';
// constants
import { useEffect } from 'react';
import { dispatch } from 'redux/store';
import { getTemplates } from 'redux/slices/templates';
import { getForms } from 'redux/slices/forms';
import Iconify from 'components/Iconify';
import { getEnvelopes } from 'redux/slices/envelopes';
import EnvelopesListView from 'sections/@dashboard/signing-status/view/envelopes-list-view';

// ----------------------------------------------------------------------

export default function SigningStatus() {
  const title = `Signing Status`;

  useEffect(() => {
    dispatch(getTemplates());
    dispatch(getForms());
    dispatch(getEnvelopes());
  }, []);

  return (
    <Page title={title}>
      <Container maxWidth="lg">
        <Stack sx={{ mb: 5 }} direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">{title}</Typography>
          <Tooltip
            title={
              <Typography>
                Upon advisor review and finalization, forms evolve into envelopes for secure
                transmission via DocuSign. Note that not all forms require signatures; some serve
                solely for data collection purposes, without DocuSign integration
              </Typography>
            }
          >
            <IconButton size="small">
              <Iconify color="gray" icon="eva:question-mark-circle-fill" />
            </IconButton>
          </Tooltip>
        </Stack>

        <EnvelopesListView />
      </Container>
    </Page>
  );
}
