import { CustomFieldType } from '../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';

export type TCustomField = {
  id: string;
  workspaceId: string;
  fieldName: string;
  fieldType: CustomFieldType;
  defaultValue?: string;
  dropdownOptions?: string[];
  isRequired: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TAddCustomField = {
  workspaceId: string;
  fieldName: string;
  fieldType: CustomFieldType;
  defaultValue?: string;
  dropdownOptions?: string[];
  isRequired: boolean;
};

export type TUpdateCustomField = {
  id: string;
  fieldName?: string;
  fieldType?: CustomFieldType;
  defaultValue?: string;
  dropdownOptions?: string[];
  isRequired?: boolean;
  isArchived?: boolean;
};
