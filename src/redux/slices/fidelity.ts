import { AdvisorManager } from '../../@types/advisor';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

export async function getFidelitySaml({ advisor }: { advisor: AdvisorManager }) {
  try {
    const response = await API.post('bitsybackendv2', `/saml/fidelity`, {
      body: { advisor },
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIDELITY slice in the getFidelitySaml function',
      },
    });
    console.error(error);
    throw error;
  }
}
