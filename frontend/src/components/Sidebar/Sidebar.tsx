import images from '../../constants/images';
import { sidebar } from '../../constants/sidebar';
import { useAuth } from '../../context/AuthProvider';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const { logout } = useAuth();
  return (
    <div className='fixed top-0 left-0 w-[260px] h-screen bg-[#FAFAFA] flex flex-col justify-between p-4 border-r-[2px] border-[#EFF0F2]'>
      <div className='space-y-4'>
        <div className='py-2'>
          <img src={images.logo} alt='logo' className='max-w-[180px]' />
        </div>
        <div>
          <div className='space-y-2'>
            <p className='uppercase text-xs tracking-wider font-medium text-[#4F4F57]'>
              General
            </p>
            {sidebar.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
      <div onClick={logout}>Logout</div>
    </div>
  );
};

export default Sidebar;
