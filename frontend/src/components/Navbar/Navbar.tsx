import { useNavigate } from 'react-router';
import { Menu, Settings } from 'lucide-react';
import { TCustomer } from '../../types/Customer';
import { useAuth } from '../../context/AuthProvider';

interface INavbar {
  customer?: TCustomer;
}

const Navbar = ({ customer }: INavbar) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <div className='pl-6 pr-4 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900'>
        <button
          type='button'
          aria-label='Open navigation'
          onClick={() => window.dispatchEvent(new Event('fieldsync:open-sidebar'))}
          className='md:hidden mr-3 p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        >
          <Menu className='w-5 h-5' />
        </button>
        <div className='text-[#6c757d] dark:text-gray-400 flex items-center space-x-3'>
          <span>{user?.workspace?.name}</span>
          {customer && (
            <>
              <div className='w-[1px] h-[24px] bg-border-primary dark:bg-gray-700'></div>
              <span className='font-semibold dark:text-gray-200'>
                {customer.isCompany
                  ? customer.companyName
                  : `${customer.firstName} ${customer.lastName}`}
              </span>
            </>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <button type='button' aria-label='Open settings' onClick={() => navigate('/settings')} className='p-2 cursor-pointer rounded-lg text-gray-500 hover:bg-[#f1f1f1] dark:text-gray-400 dark:hover:bg-gray-800'>
            <Settings className='w-5 h-5' />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
