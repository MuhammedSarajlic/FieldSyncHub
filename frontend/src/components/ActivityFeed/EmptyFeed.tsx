import { Bell } from 'lucide-react';

const EmptyFeed = () => {
  return (
    <div className='p-6 flex flex-col items-center text-center gap-3'>
      <div className='p-4 bg-surface-subtle rounded-full'>
        <Bell className='w-6 h-6' />
      </div>
      <div className='text-primary font-semibold'>No workspace activity yet</div>
    </div>
  );
};

export default EmptyFeed;
