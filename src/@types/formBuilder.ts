import { FieldType } from 'constants/fieldTypes';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  fieldKey: string;
  custom?: {
    signer?: string;
    radioButtonValue?: string;
    dateFormat?: string;
  };
  overlay: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
