import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// ----------------------------------------------------------------------

export async function createStripeCheckout({
  customerId,
  planType,
  paymentFreq,
  priceId,
  quantity = 1,
  successUrlPath = '',
  redirectParams = {},
}: {
  customerId: string;
  planType: string;
  paymentFreq: string;
  priceId: string;
  quantity?: number;
  successUrlPath?: string;
  redirectParams?: {
    [key: string]: string;
  };
}) {
  try {
    const response = await API.post('bitsybackendv2', `/stripe/checkout`, {
      body: {
        customerId,
        planType,
        paymentFreq,
        priceId,
        quantity,
        successUrlPath,
        redirectParams,
      },
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STRIPE slice in the createStripeCheckout function',
      },
    });
    throw error;
  }
}

export async function getStripeCustomerPortal({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl?: string;
}) {
  try {
    const response = await API.post('bitsybackendv2', `/stripe/customer/portal`, {
      body: { customerId, returnUrl },
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STRIPE slice in the getStripeCustomerPortal function',
      },
    });
    throw error;
  }
}
