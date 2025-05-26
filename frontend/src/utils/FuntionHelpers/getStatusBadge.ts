export const getStatusBadge = (
  status: string
): { background: string; indicator: string } => {
  switch (status) {
    case 'active':
      return {
        background: 'bg-green-100 text-green-800',
        indicator: 'bg-green-500',
      };
    case 'on-leave':
      return {
        background: 'bg-yellow-100 text-yellow-800',
        indicator: 'bg-yellow-500',
      };
    case 'terminated':
      return {
        background: 'bg-red-100 text-red-800',
        indicator: 'bg-red-500',
      };
    default:
      return {
        background: 'bg-gray-100 text-gray-800',
        indicator: 'bg-gray-500',
      };
  }
};
