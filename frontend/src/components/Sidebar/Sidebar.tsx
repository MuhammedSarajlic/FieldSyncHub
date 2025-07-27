import { useState } from 'react';
import SidebarItem from './SidebarItem';
import { ChevronDown, LogOut, Settings, Smartphone, User } from 'lucide-react';
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

  const mockUser = {
    name: 'John Mitchell',
    email: 'john@fieldsync.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <div className='fixed'>
      {/* Sidebar */}
      <div className='w-64 h-screen bg-white border-r border-gray-100 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b border-gray-100'>
          <img
            src={images.logo}
            alt='logo'
            className={`max-w-[140px] transition-all duration-300`}
          />
        </div>

        {/* Navigation */}
        <div className='flex-1'>
          {/* General Section */}
          <div className='p-4'>
            <div className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-3'>
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
            <div className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-3'>
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
            <div className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-3'>
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
        <div className='m-4 rounded-lg shadow-sm bg-white border border-gray-200 '>
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className='flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
          >
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className='w-8 h-8 rounded-full'
            />
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900'>
                {user?.fullName}
              </div>
              <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
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
          <div className='absolute bottom-3 left-full w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2'>
            {/* Profile Actions */}
            <div className='px-1'>
              <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                <User className='w-4 h-4' />
                My profile @{mockUser.email.split('@')[0]}
              </button>

              <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                <Settings className='w-4 h-4' />
                Account settings
              </button>

              <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                <Smartphone className='w-4 h-4' />
                Device management
              </button>

              <button
                onClick={logout}
                className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                Sign out
              </button>
            </div>

            <div className='border-t border-gray-100 my-2'></div>

            {/* Footer */}
            <div className='px-3 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 bg-blue-600 rounded flex items-center justify-center'>
                    <span className='text-white text-xs font-bold'>FS</span>
                  </div>
                  <span className='text-sm font-medium text-gray-900'>
                    FieldSyncHub
                  </span>
                </div>
                <span className='text-xs text-gray-500'>v4.0</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
