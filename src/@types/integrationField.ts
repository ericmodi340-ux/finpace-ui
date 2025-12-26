// ----------------------------------------------------------------------

export enum RedtailFieldCategory {
  CONTACT = 'contact',
  INTERNETS = 'internets',
  NETWORTH = 'networth',
  TAX = 'tax',
  SAM = 'sam',
  NOTES = 'notes',
  PHONES = 'phones',
  ADDRESSES = 'addresses',
  ACCOUNTS = 'accounts',
  UDF = 'udf',
  CUSTOM = 'custom',
}

type RedtailFieldGroup = {
  visible: boolean;
  fields: {
    [key: string]: {
      type: 'boolean' | 'date' | 'number' | 'select' | 'string';
      visible: boolean;
    };
  };
};

export type RedtailFields = {
  [key in RedtailFieldCategory]: RedtailFieldGroup;
};

// ----------------------------------------------------------------------

export enum SalesforceFieldCategory {
  LEAD = 'Lead',
  CONTACT = 'Contact',
}

type SalesforceField = {
  label: string;
  name: string;
  type:
    | 'address'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'double'
    | 'email'
    | 'id'
    | 'phone'
    | 'picklist'
    | 'reference'
    | 'string'
    | 'textarea';
  updateable: boolean;
};

export type SalesforceFields = {
  [key in SalesforceFieldCategory]: SalesforceField[];
};

// ----------------------------------------------------------------------

type WealthboxField = {
  name: string;
  type: 'array' | 'date' | 'number' | 'object' | 'string';
  visible: boolean;
  optional: boolean;
  readonly?: boolean;
  constraints?: { [key: string]: any; format?: string; options?: { [key: string]: any } };
  fields?: {
    [key: string]: WealthboxField;
  };
  category?: string;
};

export type WealthboxFields = {
  [key: string]: WealthboxField;
};

// ----------------------------------------------------------------------

export type IntegrationFields = {
  redtail?: RedtailFields;
  salesforce?: SalesforceFields;
  wealthbox?: WealthboxFields;
};
