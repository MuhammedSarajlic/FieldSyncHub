import { TFilterOption } from '../../../types/FilterOption';

export const pricebookFilterOptions: TFilterOption[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'dropdown',
    dropdownOptions: ['AC', 'Cleaning', 'Electrical', 'Plumbing'],
  },
  {
    name: 'type',
    label: 'Type',
    type: 'dropdown',
    dropdownOptions: ['service', 'material'],
  },
  {
    name: 'price',
    label: 'Price range($)',
    type: 'range',
    valueType: 'number',
    min: 'from',
    max: 'to',
  },
  {
    name: 'isActive',
    label: 'Status',
    type: 'button-select',
    options: ['all', 'active', 'inactive'],
  },
  {
    name: 'hasImage',
    label: 'Images',
    type: 'button-select',
    options: ['all', 'has', 'none'],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'input',
    placeholder: 'Search by keyword...',
  },
];
