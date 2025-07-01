import icons from '../../constants/AssetsConstants/icons';
import ActivityItem from './ActivityItem';
import EmptyFeed from './EmptyFeed';

const ActivityFeed = ({
  setIsActivityFeedOpen,
}: {
  setIsActivityFeedOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const arr = [1];
  return (
    <div className='fixed top-0 right-0 h-screen w-[420px] bg-white shadow-lg rounded-l-xl'>
      <div className='px-4 py-6 flex items-center justify-between border-b-[1px] border-[#ced4da]'>
        <p className='text-2xl font-semibold text-[#4F4F57]'>Activity Feed</p>
        <div
          onClick={() => setIsActivityFeedOpen(false)}
          className='cursor-pointer'
        >
          <img src={icons.closeIcon} alt='close' className='w-4 h-4' />
        </div>
      </div>
      <div>
        {arr.length > 0 ? arr.map(() => <ActivityItem />) : <EmptyFeed />}
      </div>
    </div>
  );
};

export default ActivityFeed;
