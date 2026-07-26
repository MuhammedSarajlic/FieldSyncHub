import { Bell } from 'lucide-react';

const EmptyFeed = () => {
  return (
    <div className='p-4 flex items-center space-x-4 border-b-[1px] border-[#ced4da]'>
      <div className='p-4 bg-[#f1f1f1] rounded-full'>
        <Bell className='w-6 h-6' />
      </div>
      <div className='text-[#4F4F57] font-semibold'>
        No activities to report
      </div>
    </div>
  );
};

export default EmptyFeed;
