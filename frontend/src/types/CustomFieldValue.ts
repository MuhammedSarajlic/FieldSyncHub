export type TCustomFieldValue = {
  id: string;
  customerId: string;
  customFieldId: string;
  customField?: string;
  value: string | boolean;
  createdAt: string;
  updatedAt: string;
};

export type TAddCustomFieldValue = {
  customerId?: string;
  customFieldId: string;
  value: string | boolean;
};

export type TUpdateCustomFieldValue = {
  id: string;
  value: string | boolean;
};
