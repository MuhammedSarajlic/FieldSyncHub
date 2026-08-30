import { useNavigate } from 'react-router';
import { Bell, ChevronDown, Menu, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { TCustomer } from '../../types/Customer';
import { useAuth } from '../../context/AuthProvider';
import GlobalSearch from './GlobalSearch';
import ActivityFeed from '../ActivityFeed/ActivityFeed';

interface INavbar {
  customer?: TCustomer;
}

const Navbar = ({ customer }: INavbar) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
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
        <div className='text-text-muted dark:text-gray-400 flex items-center space-x-3 min-w-0'>
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
        <GlobalSearch />
        <div className='flex items-center space-x-2'>
          <div className='relative'>
            <button type='button' onClick={() => setIsNewOpen(!isNewOpen)} className='inline-flex h-10 items-center gap-1 rounded-lg bg-bg-primary px-3 text-sm font-medium text-white hover:bg-bg-primary-hover'>
              <Plus className='h-4 w-4' /> New <ChevronDown className='h-4 w-4' />
            </button>
            {isNewOpen && <div className='absolute right-0 top-11 z-40 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900'>
              {[['Job', '/jobs?create=true'], ['Quote', '/quotes?create=true'], ['Invoice', '/invoices?create=true'], ['Customer', '/customers?create=true'], ['Event', '/calendar?create=event']].map(([label, path]) => <button key={label} type='button' onClick={() => { setIsNewOpen(false); navigate(path); }} className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'>New {label}</button>)}
            </div>}
          </div>
          <button type='button' aria-label='Open activity' onClick={() => setIsActivityOpen(true)} className='p-2 cursor-pointer rounded-lg text-gray-500 hover:bg-surface-subtle dark:text-gray-400 dark:hover:bg-gray-800'>
            <Bell className='w-5 h-5' />
          </button>
          <button type='button' aria-label='Open settings' onClick={() => navigate('/settings')} className='p-2 cursor-pointer rounded-lg text-gray-500 hover:bg-surface-subtle dark:text-gray-400 dark:hover:bg-gray-800'>
            <Settings className='w-5 h-5' />
          </button>
        </div>
      </div>
      {isActivityOpen && <ActivityFeed setIsActivityFeedOpen={setIsActivityOpen} />}
    </>
  );
};

export default Navbar;
