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
    dropdownOptions: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ],
  },
];
