export type Group = {
  name: string;
  fields: string[];
  hideFromClient: boolean;
  isNonEditable?: boolean;
  isHidden?: boolean;
};

export interface CustomField {
  key: string;
  inputType:
    | 'textfield'
    | 'select'
    | 'checkbox'
    | 'email'
    | 'phone'
    | 'currency'
    | 'date'
    | 'heading';
  fieldName?: string;
  defaultValue?: string;
  isRequired?: boolean;
  isDefault?: boolean;
  column?: number;
  helpText?: string;
  tooltipText?: string;
  isHidden?: boolean;
  options?: { value?: string }[];
  isDisabled?: boolean;
}
