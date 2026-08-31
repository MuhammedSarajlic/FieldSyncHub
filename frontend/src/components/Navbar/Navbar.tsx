import { useNavigate } from 'react-router';
import {
  Bell,
  BriefcaseBusiness,
  CalendarPlus,
  ChevronDown,
  FileText,
  Menu,
  Plus,
  Receipt,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TCustomer } from '../../types/Customer';
import { useAuth } from '../../context/AuthProvider';
import GlobalSearch from './GlobalSearch';
import ActivityFeed from '../ActivityFeed/ActivityFeed';

interface INavbar {
  customer?: TCustomer;
}

const quickCreateItems = [
  { label: 'Job', path: '/jobs?create=true', icon: BriefcaseBusiness },
  { label: 'Quote', path: '/quotes?create=true', icon: FileText },
  { label: 'Invoice', path: '/invoices?create=true', icon: Receipt },
  { label: 'Customer', path: '/customers?create=true', icon: Users },
  { label: 'Event', path: '/calendar?create=event', icon: CalendarPlus },
];

const Navbar = ({ customer }: INavbar) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!newMenuRef.current?.contains(event.target as Node)) {
        setIsNewOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNewOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const workspaceName = user?.workspace?.name || 'Your workspace';
  const customerName = customer
    ? customer.isCompany
      ? customer.companyName
      : `${customer.firstName} ${customer.lastName}`
    : undefined;

  return (
    <>
      <header className='sticky top-0 z-30 border-b border-border-primary bg-surface-subtle/95 shadow-[0_1px_0_rgba(13,89,68,0.03)] backdrop-blur dark:border-gray-800 dark:bg-gray-950/95'>
        <div className='flex min-h-[4.5rem] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8'>
          <button
            type='button'
            aria-label='Open navigation'
            onClick={() => window.dispatchEvent(new Event('fieldsync:open-sidebar'))}
            className='rounded-md p-2 text-text-muted transition hover:bg-white hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-bg-primary/30 md:hidden dark:text-gray-300 dark:hover:bg-gray-800'
          >
            <Menu className='h-5 w-5' />
          </button>

          <div className='flex min-w-0 shrink-0 items-center gap-3'>
            <div className='hidden h-9 w-9 items-center justify-center rounded-md bg-bg-primary text-white shadow-sm md:flex'>
              <span className='text-sm font-bold'>FS</span>
            </div>
            <div className='min-w-0 max-w-[12rem] sm:max-w-[16rem]'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted dark:text-gray-500'>
                Workspace
              </p>
              <p className='truncate text-sm font-semibold text-text-primary dark:text-gray-100'>
                {workspaceName}
              </p>
            </div>
            {customerName && (
              <>
                <div className='hidden h-8 w-px bg-border-primary sm:block dark:bg-gray-700' />
                <div className='hidden min-w-0 max-w-[12rem] sm:block'>
                  <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted dark:text-gray-500'>
                    Customer
                  </p>
                  <p className='truncate text-sm font-semibold text-text-primary dark:text-gray-100'>
                    {customerName}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className='order-last min-w-0 basis-full md:order-none md:flex-1'>
            <GlobalSearch className='mx-auto max-w-xl' />
          </div>

          <div className='ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2'>
            <div ref={newMenuRef} className='relative'>
              <button
                type='button'
                aria-expanded={isNewOpen}
                aria-haspopup='menu'
                onClick={() => setIsNewOpen((isOpen) => !isOpen)}
                className='inline-flex h-10 items-center gap-1.5 rounded-md bg-bg-primary px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-bg-primary/30'
              >
                <Plus className='h-4 w-4' strokeWidth={2.5} />
                <span className='hidden sm:inline'>New</span>
                <ChevronDown className='h-3.5 w-3.5' />
              </button>
              {isNewOpen && (
                <div
                  role='menu'
                  aria-label='Create new'
                  className='absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-lg border border-border-primary bg-white p-2 shadow-[0_14px_36px_rgba(23,33,29,0.14)] dark:border-gray-700 dark:bg-gray-900'
                >
                  <div className='px-3 pb-2 pt-1'>
                    <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted dark:text-gray-500'>
                      Quick create
                    </p>
                    <p className='mt-1 text-xs text-text-muted dark:text-gray-400'>
                      Start a new piece of work
                    </p>
                  </div>
                  <div className='space-y-0.5'>
                    {quickCreateItems.map(({ label, path, icon: Icon }) => (
                      <button
                        key={label}
                        type='button'
                        role='menuitem'
                        onClick={() => {
                          setIsNewOpen(false);
                          navigate(path);
                        }}
                        className='flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-bg-primary/20 dark:hover:bg-gray-800'
                      >
                        <span className='flex h-8 w-8 items-center justify-center rounded-md bg-surface-subtle text-bg-primary dark:bg-gray-800 dark:text-emerald-300'>
                          <Icon className='h-4 w-4' />
                        </span>
                        <span className='text-sm font-medium text-text-primary dark:text-gray-100'>
                          New {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type='button'
              aria-label='Open activity'
              title='Activity'
              onClick={() => setIsActivityOpen(true)}
              className='relative rounded-md p-2.5 text-text-muted transition hover:bg-white hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-bg-primary/30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            >
              <Bell className='h-[18px] w-[18px]' />
            </button>
            <button
              type='button'
              aria-label='Open settings'
              title='Settings'
              onClick={() => navigate('/settings')}
              className='rounded-md p-2.5 text-text-muted transition hover:bg-white hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-bg-primary/30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            >
              <Settings className='h-[18px] w-[18px]' />
            </button>
          </div>
        </div>
      </header>
      {isActivityOpen && <ActivityFeed setIsActivityFeedOpen={setIsActivityOpen} />}
    </>
  );
};

export default Navbar;
