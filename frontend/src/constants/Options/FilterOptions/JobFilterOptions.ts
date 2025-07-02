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
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'dispatched', label: 'Dispatched' },
      { value: 'inProgress', label: 'In progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'dropdown',
    dropdownOptions: [
      { value: 'low', label: 'Low' },
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
];
