import images from '../../constants/AssetsConstants/images';
import { sidebar } from '../../constants/sidebar';
import { useAuth } from '../../context/AuthProvider';
import SidebarItem from './SidebarItem';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      <div className='flex flex-col h-full'>
        {/* Logo Section */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <div className='flex items-center'>
            <img
              src={images.logo}
              alt='logo'
              className={`${
                isCollapsed ? 'w-10' : 'max-w-[140px]'
              } transition-all duration-300`}
            />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='p-1.5 rounded-md hover:bg-gray-100 text-gray-500'
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <div className='flex-1 py-4 px-3 overflow-y-auto'>
          <div className='space-y-1'>
            {sidebar.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className='p-4 border-t border-gray-100'>
          <button
            onClick={logout}
            className={`flex items-center ${
              isCollapsed ? 'justify-center w-full' : 'px-3 py-2'
            } rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!isCollapsed && <span className='ml-3 font-medium'>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
