export const employeeFilterOptions = [
  {
    name: 'date',
    label: 'Hire date',
    type: 'range',
    valueType: 'date',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'button-select',
    options: ['all', 'active', 'inactive'],
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
