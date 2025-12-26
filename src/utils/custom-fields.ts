import * as Yup from 'yup';
import { startCase } from 'lodash';
import { CustomField } from '../@types/custom-fields';

const phoneNumberSchema = Yup.string()
  .nullable()
  .notRequired()
  .test('phone-number', 'Invalid phone number', (value) => {
    if (!value) {
      // Return true if the value is null or empty
      return true;
    }

    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) return false;
    return true;
  });

export function getCustomFieldFormScheme(field: CustomField, skipRequired = false) {
  let fieldSchema: Yup.AnySchema;

  if (field.isHidden) return {};

  if (
    field.inputType === 'textfield' ||
    field.inputType === 'currency' ||
    field.inputType === 'date'
  ) {
    fieldSchema = Yup.string();
    if (!skipRequired && field.isRequired) {
      fieldSchema = fieldSchema.required(`${startCase(field.fieldName)} is required`);
    }
    return {
      [field.key]: fieldSchema,
    };
  }

  if (field.inputType === 'select') {
    fieldSchema = Yup.string();
    if (!skipRequired && field.isRequired) {
      fieldSchema = fieldSchema
        .oneOf([...(field?.options?.map((item) => item.value || '') || [])], 'Invalid option')
        .required(`${startCase(field.fieldName)} is required`);
    }
    return {
      [field.key]: fieldSchema,
    };
  }

  if (field.inputType === 'email') {
    fieldSchema = Yup.string().email();
    if (!skipRequired && field.isRequired) {
      fieldSchema = fieldSchema.required(`${startCase(field.fieldName)} is required`);
    }
    return {
      [field.key]: fieldSchema,
    };
  }

  if (field.inputType === 'phone') {
    fieldSchema = phoneNumberSchema;
    return {
      [field.key]: fieldSchema,
    };
  }

  if (field.inputType === 'checkbox') {
    fieldSchema = Yup.boolean();
    return {
      [field.key]: fieldSchema,
    };
  }

  return {};
}

export function getCustomFieldDefaultValue(field: CustomField, regObj: any) {
  if (field.inputType === 'checkbox') {
    return { [field.key]: regObj?.[field.key] || false };
  }
  return { [field.key]: regObj?.[field.key] || field.defaultValue || '' };
}

export function generateCustomFieldValue(field: CustomField) {
  switch (field.inputType) {
    case 'textfield':
      return 'example text';

    case 'email':
      return 'example@example.com';

    case 'phone':
      return '1234567890';

    case 'select':
      if (field?.options && field.options.length > 0) {
        const randomIndex = Math.floor(Math.random() * field.options.length);
        return field.options[randomIndex].value;
      }
      return 'exampleOption';

    case 'checkbox':
      return Math.random() < 0.5;

    default:
      return null;
  }
}
