import Iconify from 'components/Iconify';

export const fieldTypes = [
  { type: 'text', icon: <Iconify icon="mdi:format-text" />, label: 'Text Field' },
  { type: 'checkbox', icon: <Iconify icon="mdi:checkbox-outline" />, label: 'Checkbox' },
  {
    type: 'radio-button',
    icon: <Iconify icon="mdi:radio-button-checked" />,
    label: 'Radio Button',
  },
  { type: 'signature', icon: <Iconify icon="mdi:signature-freehand" />, label: 'Signature' },
  { type: 'initial', icon: <Iconify icon="mdi:signature" />, label: 'Initial' },
  { type: 'date-signed', icon: <Iconify icon="mdi:date-range" />, label: 'Date Signed' },
] as const;

export type FieldType = (typeof fieldTypes)[number]['type'];
