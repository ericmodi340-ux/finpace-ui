import { FieldType } from 'constants/fieldTypes';
import { FormField } from '../../../../@types/formBuilder';

export function getDefaultFieldContent({
  type,
  pageNumber,
  x,
  y,
  scale,
}: {
  type: FieldType;
  pageNumber: number;
  x: number;
  y: number;
  scale: number;
}): FormField {
  const id = `${type}-${Date.now()}`;

  if (type === 'text') {
    return {
      id,
      type,
      label: type,
      fieldKey: type,
      overlay: {
        page: pageNumber,
        height: Math.round(12 * scale),
        width: Math.round(70 * scale),
        x,
        y,
      },
    };
  }

  if (type === 'checkbox') {
    return {
      id,
      type,
      label: type,
      fieldKey: type,
      overlay: {
        page: pageNumber,
        height: Math.round(12 * scale),
        width: Math.round(12 * scale),
        x,
        y,
      },
    };
  }

  if (type === 'radio-button') {
    return {
      id,
      type,
      label: type,
      fieldKey: type,
      custom: {
        radioButtonValue: '',
      },
      overlay: {
        page: pageNumber,
        height: Math.round(12 * scale),
        width: Math.round(12 * scale),
        x,
        y,
      },
    };
  }

  if (type === 'initial' || type === 'signature') {
    return {
      id,
      type,
      label: type,
      fieldKey: type,
      custom: {
        signer: 'client_1',
      },
      overlay: {
        page: pageNumber,
        height: Math.round(34 * scale),
        width: Math.round(90 * scale),
        x,
        y,
      },
    };
  }

  if (type === 'date-signed') {
    return {
      id,
      type,
      label: 'Date Signed',
      fieldKey: 'date-signed',
      custom: {
        signer: 'client_1',
        dateFormat: 'MM/dd/yyyy',
      },
      overlay: {
        page: pageNumber,
        height: Math.round(12 * scale),
        width: Math.round(90 * scale),
        x,
        y,
      },
    };
  }

  return {
    id: `${type}-${Date.now()}`,
    type,
    label: `New ${type} field`,
    fieldKey: `${type}-${Date.now()}`,
    overlay: {
      page: pageNumber,
      height: Math.round(12 * scale),
      width: Math.round(70 * scale),
      x,
      y,
    },
  };
}
