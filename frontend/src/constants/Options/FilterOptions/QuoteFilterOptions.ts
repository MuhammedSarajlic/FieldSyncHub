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
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'approved', label: 'Approved' },
      { value: 'declined', label: 'Declined' },
      { value: 'expired', label: 'Expired' },
      { value: 'convertedToJob', label: 'Converted to job' },
    ],
  },
];
