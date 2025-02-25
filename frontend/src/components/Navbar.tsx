import { useState } from 'react';
import icons from '../constants/icons';
import ActivityFeed from './ActivityFeed/ActivityFeed';

const Navbar = () => {
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState<boolean>(false);
  return (
    <>
      <div className='px-4 h-16 flex items-center justify-between'>
        <div className='font-semibold text-[#6c757d]'>INAT Digital</div>
        <div className='flex items-center space-x-2'>
          <div
            onClick={() => setIsActivityFeedOpen(true)}
            className='p-2 cursor-pointer rounded-lg hover:bg-[#f1f1f1]'
          >
            <img
              src={icons.notificationIcon}
              alt='notification'
              className='w-6 h-6'
            />
          </div>
          <div className='p-2 cursor-pointer rounded-lg hover:bg-[#f1f1f1]'>
            <img src={icons.helpIcon} alt='help' className='w-6 h-6' />
          </div>
          <div className='p-2 cursor-pointer rounded-lg hover:bg-[#f1f1f1]'>
            <img src={icons.settingsIcon} alt='settings' className='w-6 h-6' />
          </div>
        </div>
      </div>
      {isActivityFeedOpen && (
        <ActivityFeed setIsActivityFeedOpen={setIsActivityFeedOpen} />
      )}
    </>
  );
};

export default Navbar;
