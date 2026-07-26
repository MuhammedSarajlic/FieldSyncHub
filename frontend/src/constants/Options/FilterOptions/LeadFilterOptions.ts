import { TFilterOption } from '../../../types/FilterOption';

export const leadFilterOptions: TFilterOption[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'button-select',
    options: ['all', 'pending', 'reviewed', 'approved', 'declined', 'converted'],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'button-select',
    options: ['all', 'low', 'normal', 'high', 'urgent'],
  },
  {
    name: 'createdDate',
    label: 'Created date',
    type: 'range',
    valueType: 'date',
  },
];
