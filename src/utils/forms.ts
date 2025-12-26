// @types
import { ClientManager } from '../@types/client';
import { FormManager, FormStatus, FormSubmission } from '../@types/form';
import { FormBuilderFieldsMapping, TemplateField } from '../@types/template';
import { UserRole } from '../@types/user';
// constants
import { formStatuses } from 'constants/forms';
import { updateForm, updatePublicForm } from 'redux/slices/forms';
import { createStorageItem } from 'redux/slices/storage';
import { isArray, startCase } from 'lodash';
import { AuthUserType } from '../@types/auth';
import { isGWN } from './firm';

// ----------------------------------------------------------------------

export function makeNestedComponentsNotRequired(
  components: TemplateField[] | undefined
): TemplateField[] | undefined {
  if (!components) {
    return;
  }

  return components.map((component) => {
    let newComponent: TemplateField = {
      ...component,
      components: makeNestedComponentsNotRequired(component.components),
      validate: { ...(component?.validate || {}), required: false },
    };

    // Day fields - don't require month/day/year which determine their required status in a different place than validate object
    let fields: any | undefined = undefined;
    if (component.type === 'day') {
      fields = Object.assign({}, component.fields);

      Object.keys(fields).forEach((datePart) => {
        fields[datePart] = { ...fields[datePart], required: false };
      });
    }

    if (fields) {
      newComponent = { ...newComponent, fields };
    }

    return newComponent;
  });
}

export function makeComponentsNotRequired(
  pages: FormBuilderFieldsMapping[] | undefined
): FormBuilderFieldsMapping[] {
  if (!pages) {
    return [];
  }

  return pages.map((page) => ({
    ...page,
    components: makeNestedComponentsNotRequired(page.components) || [],
    validate: { ...(page?.validate || {}), required: false },
  }));
}

function flattenComponents(components: FormBuilderFieldsMapping[], clientObj: any) {
  const flattenedComponents = new Set();

  function flattenComponentsRecursively(component: any) {
    // show conditional fields if component?.conditional?.when

    if (component?.conditional?.when) {
      let value = clientObj[component?.conditional?.when];

      if (typeof value === 'object') {
        // I need to remove if value is not eq and show
        if (component?.conditional?.show === true) {
          if (!value?.[component?.conditional?.eq]) {
            return;
          }
        } else if (component?.conditional?.show === false) {
          if (value?.[component?.conditional?.eq]) {
            return;
          }
        }
      }

      if (typeof value !== 'object') {
        if (component?.conditional?.show) {
          if (String(value) !== String(component?.conditional?.eq)) {
            return;
          }
        } else {
          if (String(value) === String(component?.conditional?.eq)) {
            return;
          }
        }
      }
    }

    if (component?.key) {
      if (component.type === 'datagrid') {
        flattenedComponents.add(component?.key);
        return;
      }
      flattenedComponents.add(component?.key);
    }

    if (isArray(component?.components)) {
      for (const nestedComponent of component?.components) {
        flattenComponentsRecursively(nestedComponent);
      }
    }
    if (isArray(component?.columns)) {
      for (const nestedComponent of component?.columns) {
        flattenComponentsRecursively(nestedComponent);
      }
    }
    if (isArray(component?.rows)) {
      for (const nestedColumn of component?.rows) {
        if (isArray(nestedColumn)) {
          for (const nestedComponent of nestedColumn) {
            flattenComponentsRecursively(nestedComponent);
          }
        }
      }
    }
  }

  for (const component of components) {
    flattenComponentsRecursively(component);
  }

  return flattenedComponents;
}

export function filterObjectBySet(clientObj: any, keysSet: Set<any>): Record<string, any> {
  const initSubmittion: Record<string, any> = {};

  // Iterate over the object's keys
  for (const key of Array.from(keysSet)) {
    if (clientObj[key] !== undefined) {
      initSubmittion[key] = clientObj[key];
    } else if (key?.split('.')?.length > 1) {
      const keySplit = key.split('.')[0];
      if (clientObj[keySplit] !== undefined && initSubmittion[keySplit] === undefined) {
        initSubmittion[keySplit] = clientObj[keySplit];
      }
    }
  }

  return initSubmittion;
}

export function prefillFieldsFromBitsy(
  client: ClientManager | undefined,
  templateFields: FormBuilderFieldsMapping[]
) {
  if (!client) {
    return {};
  }

  const { custom, ...rest } = client;

  const newObj = {
    ...custom,
    ...rest,
  };

  return filterObjectBySet(newObj, flattenComponents(templateFields, newObj));
}

/**
 * Extracts all field names from a SurveyJS schema by traversing pages and elements.
 *
 * @param surveyJsSchema - The SurveyJS template schema
 * @returns Set of field names found in the schema
 */
export const extractSurveyJsFieldNames = (surveyJsSchema: any): Set<string> => {
  const fieldNames = new Set<string>();

  if (!surveyJsSchema || !surveyJsSchema.pages) {
    return fieldNames;
  }

  // Traverse all pages and elements to extract field names
  surveyJsSchema.pages.forEach((page: any) => {
    if (page.elements) {
      page.elements.forEach((element: any) => {
        if (element.name) {
          fieldNames.add(element.name);
        }
      });
    }
  });

  return fieldNames;
};

/**
 * Prefills custom field values from previous forms in a composite template stepper.
 * This enables cross-template custom field sharing by extracting values from
 * previous submissions and only including fields that exist in the current template.
 *
 * @param lastSubmission - The complete submission object containing data from all previous forms
 * @param surveyJsSchema - The SurveyJS schema of the current template
 * @param currentTemplateId - The ID of the current template to exclude from previous submissions
 * @returns Object containing custom field values to prefill in the current form
 */
export const prefillCustomFieldsFromPreviousFormsV2 = (
  lastSubmission: FormSubmission | null | undefined,
  surveyJsSchema: any,
  currentTemplateId: string
): Record<string, any> => {
  if (!lastSubmission || !surveyJsSchema) {
    return {};
  }

  // Get all field names from the current SurveyJS template
  const currentTemplateFieldNames = extractSurveyJsFieldNames(surveyJsSchema);

  const customFieldValues: Record<string, any> = {};

  // Iterate through all previous submissions (excluding current template)
  Object.entries(lastSubmission).forEach(([templateId, submissionData]) => {
    if (templateId === currentTemplateId || !submissionData) {
      return;
    }

    // Extract custom field values from this submission
    Object.entries(submissionData).forEach(([fieldKey]) => {
      // Only include fields that exist in the current template and have a value
      if (
        currentTemplateFieldNames.has(fieldKey) &&
        submissionData[fieldKey] !== undefined &&
        submissionData[fieldKey] !== ''
      ) {
        customFieldValues[fieldKey] = submissionData[fieldKey];
      }
    });
  });

  return customFieldValues;
};

/**
 * Prefills custom field values from previous forms in a composite template stepper.
 * This enables cross-template custom field sharing by extracting values from
 * previous submissions and only including fields that exist in the current template.
 *
 * @param lastSubmission - The complete submission object containing data from all previous forms
 * @param templateFields - The fields configuration of the current template (FormIO format)
 * @param currentTemplateId - The ID of the current template to exclude from previous submissions
 * @returns Object containing custom field values to prefill in the current form
 */
export const prefillCustomFieldsFromPreviousForms = (
  lastSubmission: FormSubmission | null | undefined,
  templateFields: any[],
  currentTemplateId: string
): Record<string, any> => {
  if (!lastSubmission || !templateFields) {
    return {};
  }

  // Get all field keys from the current template using the existing flattenComponents utility
  const currentTemplateFieldKeys = flattenComponents(templateFields, {});

  const customFieldValues: Record<string, any> = {};

  // Iterate through all previous submissions (excluding current template)
  Object.entries(lastSubmission).forEach(([templateId, submissionData]) => {
    if (templateId === currentTemplateId || !submissionData) {
      return;
    }

    // Extract custom field values from this submission
    Object.entries(submissionData).forEach(([fieldKey]) => {
      // Only include fields that exist in the current template and have a value
      if (
        currentTemplateFieldKeys.has(fieldKey) &&
        submissionData[fieldKey] !== undefined &&
        submissionData[fieldKey] !== ''
      ) {
        customFieldValues[fieldKey] = submissionData[fieldKey];
      }
    });
  });

  console.log(
    `[Form Prefill] Found ${Object.keys(customFieldValues).length} custom fields to prefill:`,
    customFieldValues
  );

  return customFieldValues;
};

export const updateFormInDb = async ({
  schema,
  page,
  currentForm,
  user,
  templateId,
  isPublic = false,
  shouldUpdateState = true,
}: {
  schema: Record<string, any>;
  page?: string;
  currentForm: FormManager | undefined;
  templateId: string;
  user: AuthUserType;
  isPublic?: boolean;
  shouldUpdateState?: boolean;
}) => {
  if (!user || !currentForm) return;

  try {
    const images: any = {
      ids: [],
      docuvault: [],
    };
    for (const key in schema) {
      if (key.startsWith('s3upload-')) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, type, name] = key.split('-');
        const val = schema[key];
        if (type === 'ids') {
          images.ids.push(
            ...val
              .filter((obj: any) => obj.url && !obj.s3key)
              .map((obj: any, i: number) => {
                schema[key][i].s3key = `clients/${currentForm.clientId}/images/${name}`;
                return { type: name, obj };
              })
          );
        } else {
          images.docuvault.push(
            ...val
              .filter((obj: any) => obj.url && !obj.s3key)
              .map((obj: any, i: number) => {
                schema[key][i].s3key =
                  `clients/${currentForm.clientId}/docuvault/${obj.originalName}`;
                return { type: name, obj };
              })
          );
        }
      }

      // if value is 00/00/0000, set it to null
      // formio bug, where it stores empty dates as 00/00/0000
      if (schema[key] === '00/00/0000') {
        if (isGWN(user?.firmId)) {
          schema[key] = '01/01/1900';
        } else {
          schema[key] = '';
        }
      }
    }

    for (const img of images.ids) {
      const { type, obj } = img;
      const blob = await fetch(obj.url).then((res) => res.blob());

      await createStorageItem({
        path: `clients/${currentForm.clientId}/images/${type}`,
        file: blob,
        contentType: obj.type,
      });
    }

    for (const img of images.docuvault) {
      const { obj } = img;
      const blob = await fetch(obj.url).then((res) => res.blob());

      await createStorageItem({
        path: `clients/${currentForm.clientId}/docuvault/${obj.originalName}`,
        file: blob,
        contentType: obj.type,
      });
    }

    const newReviewers = [...currentForm.reviewers];

    if (newReviewers.length > 0) {
      const lastReviewerIndex = newReviewers.length - 1;
      const lastReviewer = newReviewers[lastReviewerIndex];
      if (lastReviewer.id === user.sub) {
        newReviewers[lastReviewerIndex] = {
          ...lastReviewer,
          dateReviewed: new Date(),
        };
      } else {
        newReviewers.push({
          id: user.sub,
          name: user.name,
          type: user.role === UserRole.CLIENT ? UserRole.CLIENT : UserRole.ADVISOR,
          email: user.email,
          dateReviewed: new Date(),
        });
      }
    } else {
      newReviewers.push({
        id: user.sub,
        name: user.name,
        type: user.role === UserRole.CLIENT ? UserRole.CLIENT : UserRole.ADVISOR,
        email: user.email,
        dateReviewed: new Date(),
      });
    }

    let newAdvisorReviewedPages = currentForm.advisorReviewedPages;
    let newClientReviewedPages = currentForm.clientReviewedPages;

    if (
      user.role === UserRole.CLIENT &&
      page &&
      !newClientReviewedPages?.[templateId]?.includes(page)
    ) {
      newClientReviewedPages = {
        ...currentForm.clientReviewedPages,
        [templateId]: [...(currentForm?.clientReviewedPages?.[templateId] || []), page],
      };
    }
    if (
      user.role !== UserRole.CLIENT &&
      page &&
      !newAdvisorReviewedPages?.[templateId]?.includes(page)
    ) {
      newAdvisorReviewedPages = {
        ...currentForm.advisorReviewedPages,
        [templateId]: [...(currentForm?.advisorReviewedPages?.[templateId] || []), page],
      };
    }

    let newForm: Partial<FormManager> = {
      // reviewers: [...currentForm.reviewers],
      submission: {
        ...currentForm.submission,
        [templateId]: {
          ...schema,

          // @ts-ignore
          ...(currentForm?.orionAccountNumber && {
            orionAccountNumber: currentForm.orionAccountNumber,
          }),
        },
      },
      firmId: user?.firmId,
      reviewers: newReviewers,
      advisorReviewedPages: newAdvisorReviewedPages,
      clientReviewedPages: newClientReviewedPages,
    };

    let response;

    if (isPublic) {
      response = await updatePublicForm(currentForm.id, newForm, shouldUpdateState);
    } else {
      await updateForm(currentForm.id, newForm, shouldUpdateState);
    }

    return isPublic ? response : undefined;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSigningStatus = (form: FormManager) => {
  if (
    form.status === formStatuses.COMPLETED ||
    form.status === formStatuses.CANCELLED ||
    form.status === formStatuses.DRAFT
  ) {
    return form.status;
  }
  if (form.currentReviewerRole) {
    return `Awaiting ${startCase(form.currentReviewerRole)}` as FormStatus;
  }
  return '' as FormStatus;
};

/**
 * Flatten a nested object into dot-separated keys.
 * E.g. { client: { name: "Taran" } } => { "client.name": "Taran" }
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = '',
  res: Record<string, any> = {}
) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      flattenObject(val, newKey, res);
    } else {
      res[newKey] = val;
    }
  }
  return res;
}

/**
 * Unflatten an object with dot-separated keys back to nested.
 * E.g. { "client.name": "Taran" } => { client: { name: "Taran" } }
 */
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const flatKey in obj) {
    if (!obj.hasOwnProperty(flatKey)) continue;
    const keys = flatKey.split('.');
    keys.reduce((acc, key, i) => {
      if (i === keys.length - 1) {
        acc[key] = obj[flatKey];
      } else {
        if (!acc[key]) acc[key] = {};
      }
      return acc[key];
    }, result);
  }
  return result;
}
