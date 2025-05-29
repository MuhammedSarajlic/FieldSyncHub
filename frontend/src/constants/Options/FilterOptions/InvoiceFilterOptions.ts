import { TFilterOption } from '../../../types/FilterOption';

export const invoiceFilterOptions: TFilterOption[] = [
  {
    name: 'dueDate',
    label: 'Due Date',
    type: 'range',
    valueType: 'date',
  },
  {
    name: 'total',
    label: 'Total ($)',
    type: 'range',
    valueType: 'number',
    min: 'from',
    max: 'to',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'dropdown',
    dropdownOptions: ['all', 'draft', 'sent', 'paid', 'overdue'],
  },
];
