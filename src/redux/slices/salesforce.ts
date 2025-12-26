import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// ----------------------------------------------------------------------

export async function getSalesforceEnrollment() {
  try {
    const response = await API.post('bitsybackendv2', `/salesforce/enroll`, {
      body: {},
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in SALESFORCE slice in the getSalesforceEnrollment function',
      },
    });

    console.error(error);
    throw error;
  }
}
