import { useLocation, useNavigate } from 'react-router';
import { sidebarItem } from '../../types/sidebar_types';

const SidebarItem = ({ item }: { item: sidebarItem }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div
      onClick={() => navigate(`/${item.slug}`)}
      className={`px-2.5 py-2 flex items-center space-x-3.5 rounded-lg cursor-pointer border-[1px] hover:bg-[#EEF0F0] ${
        pathname === `/${item.slug}`
          ? 'bg-white border-[#E3E3E3] '
          : 'border-transparent'
      } `}
    >
      <img src={item.icon} alt={`${item.slug}`} className='w-5 h-5' />
      <p className={`text-sm font-semibold text-[#4F4F57]`}>{item.name}</p>
    </div>
  );
};

export default SidebarItem;
