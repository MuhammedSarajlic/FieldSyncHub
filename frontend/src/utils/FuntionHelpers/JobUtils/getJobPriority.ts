import { JobPriority } from '../../../constants/Enumeration/JobEnum/JobEnum';

export const getJobPriority = (priority: number) => {
  switch (priority) {
    case JobPriority.Low:
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case JobPriority.Normal:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case JobPriority.High:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case JobPriority.Urgent:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};
