import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { AdvisorManager } from '../../@types/advisor';

// ----------------------------------------------------------------------

export async function getSchwabSaml({ advisor }: { advisor: AdvisorManager }) {
  try {
    const response = await API.post('bitsybackendv2', `/saml/schwab`, {
      body: { advisor },
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in SCHWAB slice in the getSchwabSaml function',
      },
    });
    console.error(error);
    throw error;
  }
}
