import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Plus,
  Receipt,
  Truck,
  FileText,
} from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthProvider';
import { GetJobStats } from '../services/Job';
import { GetInvoiceStats, GetAllInvoicesByWorkspaceId } from '../services/Invoice';
import { GetCalendarEventsByWorkspaceAndDateRange } from '../services/Calendar';
import { startOfDay, endOfDay } from '../utils/CalendarHelpers';
import { formatCurrency } from '../utils/FuntionHelpers/formatCurrency';
import { getJobStatus } from '../utils/FuntionHelpers/JobUtils/getJobStatus';
import { getInvoiceStatus } from '../utils/FuntionHelpers/getInvoiceStatus';
import { JobStatus } from '../constants/Enumeration/JobEnum/JobEnum';
import { TJobStats } from '../types/Job';
import { TInvoiceStats, TInvoice } from '../types/Invoice';
import { TCalendarEvents } from '../types/Calendar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobStats, setJobStats] = useState<TJobStats | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<TInvoiceStats | null>(null);
  const [todayItems, setTodayItems] = useState<TCalendarEvents>({
    events: [],
    jobs: [],
    leads: [],
  });
  const [recentInvoices, setRecentInvoices] = useState<TInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.workspace) return;
      setIsLoading(true);
      try {
        const today = new Date();
        const [jobStatsRes, invoiceStatsRes, calendarRes, invoicesRes] =
          await Promise.all([
            GetJobStats(user.workspace.id),
            GetInvoiceStats(user.workspace.id),
            GetCalendarEventsByWorkspaceAndDateRange(
              user.workspace.id,
              startOfDay(today).toISOString(),
              endOfDay(today).toISOString()
            ),
            GetAllInvoicesByWorkspaceId(user.workspace.id, 1, 5),
          ]);

        if (jobStatsRes.status === 200) setJobStats(jobStatsRes.data.payload);
        if (invoiceStatsRes.status === 200)
          setInvoiceStats(invoiceStatsRes.data.payload);
        if (calendarRes.status === 200) setTodayItems(calendarRes.data);
        if (invoicesRes.status === 200)
          setRecentInvoices(invoicesRes.data.payload?.items ?? []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.workspace]);

  const todaysJobs = [...todayItems.jobs].sort(
    (a, b) =>
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );

  const formatTime = (dateTime: string) =>
    new Date(dateTime).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />

        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className='flex items-center px-4 py-2.5 bg-bg-primary text-white rounded-lg hover:bg-bg-primary-hover transition-colors'
            >
              <CalendarDays className='mr-2' size={18} />
              View Calendar
            </button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              icon={<ClipboardList className='text-blue-500' />}
              iconBg='bg-blue-50'
              title='Scheduled Jobs'
              value={isLoading ? '—' : jobStats?.scheduledJobs ?? 0}
            />
            <StatCard
              icon={<CheckCircle2 className='text-green-500' />}
              iconBg='bg-green-50'
              title='Completed Jobs'
              value={isLoading ? '—' : jobStats?.completedJobs ?? 0}
            />
            <StatCard
              icon={<AlertTriangle className='text-red-500' />}
              iconBg='bg-red-50'
              title='Overdue Invoices'
              value={isLoading ? '—' : invoiceStats?.overdueCount ?? 0}
            />
            <StatCard
              icon={<DollarSign className='text-purple-500' />}
              iconBg='bg-purple-50'
              title='Paid This Month'
              value={
                isLoading
                  ? '—'
                  : formatCurrency(invoiceStats?.totalPaidThisMonth)
              }
            />
          </div>

          {/* Two-Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Today's Schedule */}
            <div className='lg:col-span-2 bg-white rounded-xl shadow-sm p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-semibold'>Today's Schedule</h2>
                <button
                  onClick={() => navigate('/jobs')}
                  className='text-bg-primary hover:text-bg-primary-hover text-sm font-medium'
                >
                  View All
                </button>
              </div>

              {isLoading ? (
                <div className='py-10 text-center text-sm text-gray-400'>
                  Loading...
                </div>
              ) : todaysJobs.length === 0 ? (
                <div className='py-10 text-center text-sm text-gray-500'>
                  Nothing scheduled for today.
                </div>
              ) : (
                <div className='space-y-3'>
                  {todaysJobs.map((job) => {
                    const status = getJobStatus(job.status);
                    return (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className='border border-gray-200 rounded-lg p-4 hover:border-bg-primary/40 hover:shadow-sm transition-all cursor-pointer'
                      >
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='font-medium text-gray-900'>
                              {job.title}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {job.customer?.isCompany
                                ? job.customer?.companyName
                                : `${job.customer?.firstName ?? ''} ${
                                    job.customer?.lastName ?? ''
                                  }`.trim() || 'No customer'}
                            </p>
                          </div>
                          <span className='text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded'>
                            {formatTime(job.startDateTime)}
                          </span>
                        </div>
                        <div className='flex items-center justify-between mt-3'>
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}
                          >
                            {status.icon}
                            {JobStatus[job.status]}
                          </span>
                          {job.assignedTeamMembers?.length > 0 && (
                            <span className='text-xs text-gray-500'>
                              {job.assignedTeamMembers
                                .map((e) => e.user?.fullName)
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions + Recent Invoices */}
            <div className='space-y-6'>
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-lg font-semibold mb-4'>Quick Actions</h2>
                <div className='grid grid-cols-2 gap-3'>
                  <ActionButton
                    icon={<Plus />}
                    label='New Job'
                    onClick={() => navigate('/jobs')}
                  />
                  <ActionButton
                    icon={<Receipt />}
                    label='New Invoice'
                    onClick={() => navigate('/invoices')}
                  />
                  <ActionButton
                    icon={<Truck />}
                    label='Dispatch Board'
                    onClick={() => navigate('/dispatch')}
                  />
                  <ActionButton
                    icon={<FileText />}
                    label='Quotes'
                    onClick={() => navigate('/quotes')}
                  />
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-sm p-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold'>Recent Invoices</h2>
                  <button
                    onClick={() => navigate('/invoices')}
                    className='text-bg-primary hover:text-bg-primary-hover text-sm font-medium'
                  >
                    View All
                  </button>
                </div>
                {isLoading ? (
                  <div className='py-6 text-center text-sm text-gray-400'>
                    Loading...
                  </div>
                ) : recentInvoices.length === 0 ? (
                  <div className='py-6 text-center text-sm text-gray-500'>
                    No invoices yet.
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {recentInvoices.map((invoice) => {
                      const status = getInvoiceStatus(invoice.status);
                      return (
                        <div
                          key={invoice.id}
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className='flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors'
                        >
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              #{invoice.invoiceNumber}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {invoice.customer?.isCompany
                                ? invoice.customer?.companyName
                                : `${invoice.customer?.firstName ?? ''} ${
                                    invoice.customer?.lastName ?? ''
                                  }`.trim()}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm font-semibold text-gray-900'>
                              {formatCurrency(invoice.total)}
                            </p>
                            <span
                              className={`inline-flex items-center text-[11px] px-1.5 py-0.5 rounded-full border ${status.color}`}
                            >
                              {status.icon}
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  iconBg,
  title,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
}) => (
  <div className='bg-white p-5 rounded-xl shadow-sm'>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <h3 className='text-gray-500 mt-3 text-sm font-medium'>{title}</h3>
    <p className='text-2xl font-bold mt-1'>{value}</p>
  </div>
);

const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className='flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-bg-primary/5 hover:border-bg-primary/30 transition-colors'
  >
    <div className='text-bg-primary mb-1'>{icon}</div>
    <span className='text-sm'>{label}</span>
  </button>
);

export default Home;
