import { Activity, Clock3 } from 'lucide-react';
import { TActivityHistory } from '../../types/ActivityHistory';

const ActivityItem = ({ activity }: { activity: TActivityHistory }) => {
  return (
    <div className='p-4 flex items-start space-x-4 border-b border-border-strong hover:bg-surface-subtle'>
      <div className='rounded-lg bg-surface-subtle p-2 text-bg-primary'>
        <Activity className='w-5 h-5' />
      </div>
      <div className='min-w-0 text-sm'>
        <p className='font-semibold text-brand-deep dark:text-gray-100'>
          {activity.changedByName || 'A team member'}
        </p>
        <p className='mt-1 text-text-muted dark:text-gray-400'>{activity.action}</p>
        <div className='mt-2 flex items-center gap-1.5 text-xs text-icon-muted'>
          <Clock3 className='h-3.5 w-3.5' />
          {new Date(activity.changedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
