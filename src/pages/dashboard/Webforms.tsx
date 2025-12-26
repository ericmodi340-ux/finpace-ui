// @mui
import { Container, Typography, Stack } from '@mui/material';
// components
import Page from 'components/Page';
// constants
import { useEffect } from 'react';
import { dispatch } from 'redux/store';
import { getTemplates } from 'redux/slices/templates';
import { getForms } from 'redux/slices/forms';
import { getEnvelopes } from 'redux/slices/envelopes';
import FormsListView from 'sections/@dashboard/web-forms/view/forms-list-view';

// ----------------------------------------------------------------------

export default function Webforms() {
  const title = `Online Forms`;

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
        </Stack>

        <FormsListView />
      </Container>
    </Page>
  );
}
