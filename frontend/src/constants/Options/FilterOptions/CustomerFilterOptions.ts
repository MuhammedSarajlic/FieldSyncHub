import { TFilterOption } from '../../../types/FilterOption';

export const customerFilterOptions: TFilterOption[] = [
  {
    name: 'customerType',
    label: 'Customer type',
    type: 'button-select',
    options: ['all', 'individual', 'company'],
  },
  {
    name: 'createdDate',
    label: 'Created date',
    type: 'range',
    valueType: 'date',
  },
  {
    name: 'properties',
    label: 'Properties',
    type: 'range',
    valueType: 'number',
    min: 'from',
    max: 'to',
  },
  {
    name: 'hasEmail',
    label: 'Has Email',
    type: 'button-select',
    options: ['all', 'true', 'false'],
  },
  {
    name: 'hasPhone',
    label: 'Has Phone',
    type: 'button-select',
    options: ['all', 'true', 'false'],
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'input',
    placeholder: 'Tags',
  },
];
