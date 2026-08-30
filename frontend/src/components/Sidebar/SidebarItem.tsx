import { useLocation, useNavigate } from 'react-router';
import { sidebarItem } from '../../types/sidebar_types';

interface ISidebarItem {
  item: sidebarItem;
  onNavigate?: () => void;
}

// SidebarItem Component
const SidebarItem = ({ item, onNavigate }: ISidebarItem) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname.includes(`/${item.slug}`);

  return (
    <div
      onClick={() => {
        navigate(`/${item.slug}`);
        onNavigate?.();
      }}
      className={`relative flex items-center space-x-3 min-h-11 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'bg-[#f0f7f3] border-[1px] border-[#a8d0bb]'
          : 'hover:bg-gray-50 border-[1px] border-transparent'
      }`}
    >
      {isActive && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-bg-primary rounded-r-md' />
      )}
      <item.Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-60'}`} aria-hidden='true' />

      <p
        className={`text-sm font-medium ${
          isActive ? 'text-gray-700' : 'text-gray-600'
        }`}
      >
        {item.name}
      </p>
    </div>
  );
};

export default SidebarItem;
