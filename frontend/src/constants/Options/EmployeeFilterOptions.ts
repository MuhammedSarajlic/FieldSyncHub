export const employeeFilterOptions = [
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
    dropdownOptions: ['all', 'active', 'on-leave', 'terminated'],
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
