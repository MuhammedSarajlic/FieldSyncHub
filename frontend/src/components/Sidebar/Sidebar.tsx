import images from '../../constants/AssetsConstants/images';
import { sidebar } from '../../constants/sidebar';
import { useAuth } from '../../context/AuthProvider';
import SidebarItem from './SidebarItem';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 w-[260px]`}
    >
      <div className='flex flex-col h-full'>
        {/* Logo Section */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <div className='flex items-center'>
            <img
              src={images.logo}
              alt='logo'
              className={`max-w-[140px] transition-all duration-300`}
            />
          </div>
        </div>

        {/* Navigation Section */}
        <div className='flex-1 py-4 px-3 overflow-y-auto'>
          <div className='space-y-1'>
            {sidebar.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className='p-4 border-t border-gray-100'>
          <button
            onClick={logout}
            className={`flex items-center px-3 py-2 cursor-pointer rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className='ml-3 font-medium'>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
