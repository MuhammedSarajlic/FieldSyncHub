import { TCustomFieldValue } from './CustomFieldValue';

export type TCustomFieldType = 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Checkbox';

export type TCustomField = {
  customFieldId: string;
  workspaceId: string;
  fieldName: string;
  fieldType: TCustomFieldType;
  defaultValue?: string;
  dropdownOptions?: string[];
  isRequired: boolean;
  isArchived: boolean;
  customFieldValue?: TCustomFieldValue[];
};

export type TAddCustomField = {
  fieldName: string;
  fieldType: string;
  defaultValue: string;
  dropdownOptions?: string[];
};
