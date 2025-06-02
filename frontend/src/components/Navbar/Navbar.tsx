import { useState } from 'react';
import icons from '../../constants/icons';
import ActivityFeed from '../ActivityFeed/ActivityFeed';
import { TCustomer } from '../../types/Customer';
import { useAuth } from '../../context/AuthProvider';

interface INavbar {
  customer?: TCustomer;
}

const Navbar = ({ customer }: INavbar) => {
  const { user } = useAuth();
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState<boolean>(false);
  return (
    <>
      <div className='mb-6 pl-6 pr-4 h-16 flex items-center justify-between border-b border-gray-100'>
        <div className='text-[#6c757d] flex items-center space-x-3'>
          <span>{user?.workspace?.name}</span>
          {customer && (
            <>
              <div className='w-[1px] h-[24px] bg-border-primary'></div>
              <span className='font-semibold'>
                {customer.isCompany
                  ? customer.companyName
                  : `${customer.firstName} ${customer.lastName}`}
              </span>
            </>
          )}
        </div>
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
