import { useState } from 'react';
import SidebarItem from './SidebarItem';
import { ChevronDown, LogOut } from 'lucide-react';
import { sidebarItems } from '../../constants/sidebar';
import { useAuth } from '../../context/AuthProvider';
import images from '../../constants/AssetsConstants/images';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const generalItems = sidebarItems.filter(
    (item) => item.section === 'general'
  );
  const businessItems = sidebarItems.filter(
    (item) => item.section === 'business'
  );
  const systemItems = sidebarItems.filter((item) => item.section === 'system');

  const initials = user?.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className='fixed'>
      {/* Sidebar */}
      <div className='w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b border-gray-100 dark:border-gray-800'>
          <img
            src={images.logo}
            alt='logo'
            className={`max-w-[140px] transition-all duration-300 dark:brightness-0 dark:invert`}
          />
        </div>

        {/* Navigation */}
        <div className='flex-1'>
          {/* General Section */}
          <div className='p-4'>
            <div className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3'>
              General
            </div>
            <nav className='space-y-1'>
              {generalItems.map((item) => (
                <SidebarItem key={item.slug} item={item} />
              ))}
            </nav>
          </div>

          {/* Business Section */}
          <div className='p-4'>
            <div className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3'>
              Business Operations
            </div>
            <nav className='space-y-1'>
              {businessItems.map((item) => (
                <SidebarItem key={item.slug} item={item} />
              ))}
            </nav>
          </div>

          {/* System Section */}
          <div className='p-4'>
            <div className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3'>
              System
            </div>
            <nav className='space-y-1'>
              {systemItems.map((item) => (
                <SidebarItem key={item.slug} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Section */}
        <div className='m-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'>
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className='flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
          >
            <div className='w-8 h-8 rounded-full bg-bg-primary text-white flex items-center justify-center text-xs font-semibold'>{initials}</div>
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {user?.fullName}
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                {user?.email}
              </p>
            </div>
            <ChevronDown className='w-4 h-4 text-gray-400' />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-40'
            onClick={() => setShowProfileModal(false)}
          />

          {/* Modal */}
          <div className='absolute bottom-3 left-full w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2'>
            {/* Profile Actions */}
            <div className='px-1'>
              <button
                onClick={logout}
                className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                Sign out
              </button>
            </div>

            <div className='border-t border-gray-100 dark:border-gray-700 my-2'></div>

            {/* Footer */}
            <div className='px-3 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 bg-bg-primary rounded flex items-center justify-center'>
                    <span className='text-white text-xs font-bold'>FS</span>
                  </div>
                  <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    FieldSyncHub
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
