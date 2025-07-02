import { TFilterOption } from '../../../types/FilterOption';

export const employeeFilterOptions: TFilterOption[] = [
  {
    name: 'hireDate',
    label: 'Hire date',
    type: 'range',
    valueType: 'date',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'dropdown',
    dropdownOptions: [
      { value: 'active', label: 'Active' },
      { value: 'onLeave', label: 'On leave' },
      { value: 'terminated', label: 'Terminated' },
    ],
  },
  {
    name: 'position',
    label: 'Position',
    type: 'input',
    placeholder: 'Search by keyword...',
  },
  {
    name: 'department',
    label: 'Department',
    type: 'input',
    placeholder: 'Search by keyword...',
  },
];
