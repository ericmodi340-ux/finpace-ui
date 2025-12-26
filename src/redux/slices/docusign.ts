import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// @types
import { DsTemplateType } from '../../@types/template';

// ----------------------------------------------------------------------

export async function getTemplates() {
  try {
    const response = await API.get('bitsybackendv2', `/docusign/templates`, {});
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in DOCUSIGN slice in the getTemplates function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function getTemplateTabs({
  dsTemplateType,
  dsTemplateId,
}: {
  dsTemplateType: DsTemplateType;
  dsTemplateId: string;
}) {
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/docusign/${dsTemplateType}/templates/${dsTemplateId}/tabs`,
      {}
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in DOCUSIGN slice in the getTemplateTabs function',
      },
    });
    console.error(error);
    throw error;
  }
}
