import { useEffect, useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { sidebarItems } from '../../constants/sidebar';
import { useAuth } from '../../context/AuthProvider';
import images from '../../constants/AssetsConstants/images';
import SidebarItem from './SidebarItem';
import ThemeToggle from '../CustomElements/ThemeToggle';

const Navigation = ({ onNavigate }: { onNavigate?: () => void }) => {
  const sections = [
    { label: 'General', items: sidebarItems.filter((item) => item.section === 'general') },
    { label: 'Business Operations', items: sidebarItems.filter((item) => item.section === 'business') },
    { label: 'System', items: sidebarItems.filter((item) => item.section === 'system') },
  ];

  return (
    <nav className='flex-1 overflow-y-auto px-3 py-4' aria-label='Primary navigation'>
      {sections.map((section) => (
        <div key={section.label} className='mb-6 last:mb-0'>
          <div className='px-3 mb-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
            {section.label}
          </div>
          <div className='space-y-1'>
            {section.items.map((item) => (
              <SidebarItem key={item.slug} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

const Profile = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, logout } = useAuth();
  const initials = user?.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className='m-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
      <div className='flex items-center gap-3 p-3'>
        <div className='w-9 h-9 rounded-full bg-bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0'>{initials}</div>
        <div className='min-w-0 text-left'>
          <div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>{user?.fullName}</div>
          <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user?.email}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={() => { onNavigate?.(); void logout(); }}
        className='flex items-center gap-2 w-full min-h-11 px-3 py-2 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
      >
        <LogOut className='w-4 h-4' />
        Sign out
      </button>
      <div className='border-t border-gray-100 dark:border-gray-700 px-1 py-1'>
        <ThemeToggle />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const openMenu = () => setIsMobileOpen(true);
    window.addEventListener('fieldsync:open-sidebar', openMenu);
    return () => window.removeEventListener('fieldsync:open-sidebar', openMenu);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      <aside aria-label='Workspace sidebar' className='hidden md:flex fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col'>
        <div className='h-16 px-4 flex items-center border-b border-gray-100 dark:border-gray-800'>
          <img src={images.logo} alt='FieldSyncHub' className='max-w-[140px] dark:brightness-0 dark:invert' />
        </div>
        <Navigation />
        <Profile />
      </aside>

      {isMobileOpen && (
        <div className='md:hidden fixed inset-0 z-50' role='dialog' aria-modal='true' aria-label='Navigation menu'>
          <button type='button' aria-label='Close navigation' onClick={closeMobile} className='absolute inset-0 bg-gray-950/40' />
          <aside aria-label='Workspace sidebar' className='relative flex h-full w-[min(86vw,20rem)] flex-col bg-white dark:bg-gray-900 shadow-xl'>
            <div className='h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800'>
              <img src={images.logo} alt='FieldSyncHub' className='max-w-[140px] dark:brightness-0 dark:invert' />
              <button type='button' aria-label='Close navigation' onClick={closeMobile} className='p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'>
                <X className='w-5 h-5' />
              </button>
            </div>
            <Navigation onNavigate={closeMobile} />
            <Profile onNavigate={closeMobile} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
