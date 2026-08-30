import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import EmptyFeed from './EmptyFeed';
import ActivityItem from './ActivityItem';
import { useAuth } from '../../context/AuthProvider';
import { GetWorkspaceActivity } from '../../services/Activity';
import { TActivityHistory } from '../../types/ActivityHistory';

const ActivityFeed = ({
  setIsActivityFeedOpen,
}: {
  setIsActivityFeedOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<TActivityHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      if (!user?.workspace?.id) return;
      setIsLoading(true);
      try {
        const response = await GetWorkspaceActivity(user.workspace.id);
        if (response.status === 200) setActivities(response.data.payload?.items ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    loadActivity();
  }, [user?.workspace?.id]);

  return (
    <div className='fixed top-0 right-0 z-50 h-screen w-full max-w-[420px] bg-white shadow-xl dark:bg-gray-900'>
      <div className='px-5 py-5 flex items-center justify-between border-b border-border-strong dark:border-gray-700'>
        <p className='text-lg font-semibold text-primary dark:text-gray-100'>Activity</p>
        <button type='button'
          onClick={() => setIsActivityFeedOpen(false)}
          aria-label='Close activity'
          className='cursor-pointer rounded p-1 hover:bg-surface-subtle dark:hover:bg-gray-800'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
      <div className='overflow-y-auto h-[calc(100vh-4.25rem)]'>
        {isLoading ? <div className='space-y-3 p-4'>{Array.from({ length: 5 }).map((_, index) => <div key={index} className='h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800' />)}</div> : activities.length ? activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />) : <EmptyFeed />}
      </div>
    </div>
  );
};

export default ActivityFeed;
