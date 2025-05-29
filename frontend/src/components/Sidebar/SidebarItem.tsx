import { useLocation, useNavigate } from 'react-router';
import { sidebarItem } from '../../types/sidebar_types';

interface ISidebarItem {
  item: sidebarItem;
  isCollapsed: boolean;
}

const SidebarItem = ({ item, isCollapsed }: ISidebarItem) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === `/${item.slug}`;

  return (
    <div
      onClick={() => navigate(`/${item.slug}`)}
      className={`relative flex items-center ${
        // Added 'relative' for potential indicator
        isCollapsed ? 'justify-center' : 'space-x-3'
      } px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'bg-[#f0f7f3] border-[1px] border-[#a8d0bb]'
          : 'hover:bg-gray-50 border-[1px] border-transparent'
      }`}
      title={isCollapsed ? item.name : ''}
    >
      {isActive && !isCollapsed && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-bg-primary rounded-r-md' />
      )}
      <img
        src={item.icon}
        alt={item.name}
        className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-75'}`}
      />

      {!isCollapsed && (
        <p
          className={`text-sm font-medium ${
            isActive ? 'text-text-secondary' : 'text-gray-700'
          }`}
        >
          {item.name}
        </p>
      )}
    </div>
  );
};

export default SidebarItem;
