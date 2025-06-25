import { TFilterOption } from '../../../types/FilterOption';

export const jobFilterOptions: TFilterOption[] = [
  {
    name: 'scheduleDate',
    label: 'Schedule date',
    type: 'range',
    valueType: 'date',
  },
  {
    name: 'total',
    label: 'Total',
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
      'scheduled',
      'dispatched',
      'in-progress',
      'completed',
      'cancelled',
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'dropdown',
    dropdownOptions: ['all', 'low', 'normal', 'high', 'urgent'],
  },
];
