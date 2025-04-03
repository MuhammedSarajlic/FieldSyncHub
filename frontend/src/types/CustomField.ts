import { TCustomFieldValue } from './CustomFieldValue';

export type TCustomField = {
  customFieldId: string;
  customerId: string;
  fieldName: string;
  fieldType: string;
  defaultValue: string;
  dropdownOptions?: string[];
  customFiledValue?: TCustomFieldValue[];
};

export type TAddCustomField = {
  fieldName: string;
  fieldType: string;
  defaultValue: string;
  dropdownOptions?: string[];
};
