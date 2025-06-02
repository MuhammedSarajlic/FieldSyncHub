import { TFilterOption } from '../../../types/FilterOption';

export const quoteFilterOptions: TFilterOption[] = [
  {
    name: 'createdDate',
    label: 'Created Date',
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
      'all',
      'draft',
      'sent',
      'awaiting-response',
      'awaiting-approval',
      'approved',
      'declined',
      'expired',
      'converted-to-job',
    ],
  },
];
