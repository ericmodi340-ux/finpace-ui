// ----------------------------------------------------------------------

type FormFieldOption = {
  value: string;
  label: string;
};

export type FormFieldManager = {
  name: string;
  label: string;
  type: 'TextField' | 'Select' | 'Autocomplete';
  defaultValue: string;
  options?: FormFieldOption[];
};
