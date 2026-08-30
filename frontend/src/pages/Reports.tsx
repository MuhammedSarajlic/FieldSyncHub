import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  Briefcase,
  FileText,
  Receipt,
  Users,
  UserCog,
  Package,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthProvider';
import { formatCurrency } from '../utils/FuntionHelpers/formatCurrency';
import PageLoader from '../components/CustomElements/Loaders/PageLoader';
import { GetCustomerStats } from '../services/Customer';
import { GetJobProfitability, GetJobStats } from '../services/Job';
import { GetQuoteStats } from '../services/Quote';
import { GetInvoiceStats } from '../services/Invoice';
import { GetEmployeeStats } from '../services/Employee';
import { GetServiceItemsStats } from '../services/ServiceItem';
import { GetLeadsByWorkspaceId } from '../services/Lead';
import { TLead } from '../types/Lead';
import { GetJobsByFilter } from '../services/Job';
import { GetQuotesByFilter } from '../services/Quote';
import { GetInvoicesByFilter } from '../services/Invoice';
import { TJob } from '../types/Job';
import { TQuote } from '../types/Quote';
import { TInvoice } from '../types/Invoice';
import { QuoteStatus } from '../constants/Enumeration/QuoteEnum/QuoteEnum';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TCustomerStats = {
  total: number;
  companies: number;
  individuals: number;
  newCustomers: number;
  missingInfoCustomers: number;
};

type TJobStats = {
  totalJobs: number;
  completedJobs: number;
  scheduledJobs: number;
  totalValue: number;
};
type TProfitability = { revenue: number; cost: number; marginPercent: number; byJob: { id: string; name: string; grossProfit: number }[] };

type TQuoteStats = {
  totalQuotes: number;
  totalValue: number;
  approvedValue: number;
  conversionRate: number;
};

type TInvoiceStats = {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  overdueCount: number;
  averageInvoiceValue: number;
};

type TEmployeeStats = {
  totalEmployees: number;
  activeEmployees: number;
  availableEmployees: number;
  newHiresThisMonth: number;
};

type TServiceItemStats = {
  totalItems: number;
  totalMaterialItems: number;
  totalServiceItems: number;
  totalPricebookValue: number;
  averageItemPrice: number;
};

type TTrendPoint = {
  month: string;
  revenue: number;
  jobs: number;
  winRate: number;
};

const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  caption,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  caption: string;
}) => (
  <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
    <div className='flex items-center justify-between mb-3'>
      <h3 className='text-sm font-medium text-gray-600'>{label}</h3>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
    </div>
    <div className='text-3xl font-bold text-gray-900'>{value}</div>
    <div className='text-sm text-gray-500 mt-1'>{caption}</div>
  </div>
);

const ComparisonBar = ({
  segments,
}: {
  segments: { label: string; value: number; colorClass: string }[];
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div>
      <div className='flex w-full h-3 rounded-full overflow-hidden bg-gray-100 gap-0.5'>
        {segments.map((segment, index) => {
          const pct = (segment.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={index}
              title={`${segment.label}: ${segment.value} (${pct.toFixed(0)}%)`}
              className={`${segment.colorClass} h-full transition-all duration-300`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3'>
        {segments.map((segment, index) => (
          <div key={index} className='flex items-center gap-1.5 text-sm'>
            <span className={`h-2.5 w-2.5 rounded-full ${segment.colorClass}`} />
            <span className='text-gray-600'>{segment.label}</span>
            <span className='font-medium text-gray-900'>{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800 mb-5'>
      <Icon className='w-5 h-5 text-gray-600' />
      {title}
    </h3>
    {children}
  </div>
);

const Reports = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [customerStats, setCustomerStats] = useState<TCustomerStats | null>(
    null
  );
  const [jobStats, setJobStats] = useState<TJobStats | null>(null);
  const [profitability, setProfitability] = useState<TProfitability | null>(null);
  const [quoteStats, setQuoteStats] = useState<TQuoteStats | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<TInvoiceStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<TEmployeeStats | null>(
    null
  );
  const [serviceItemStats, setServiceItemStats] =
    useState<TServiceItemStats | null>(null);
  const [leads, setLeads] = useState<TLead[]>([]);
  const [trendRange, setTrendRange] = useState('6');
  const [trendJobs, setTrendJobs] = useState<TJob[]>([]);
  const [trendQuotes, setTrendQuotes] = useState<TQuote[]>([]);
  const [trendInvoices, setTrendInvoices] = useState<TInvoice[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.workspace) return;
      const workspaceId = user.workspace.id;
      setIsLoading(true);

      const [
        customerRes,
        jobRes,
        profitabilityRes,
        quoteRes,
        invoiceRes,
        employeeRes,
        serviceItemRes,
        leadsRes,
      ] = await Promise.all([
        GetCustomerStats(workspaceId),
        GetJobStats(workspaceId),
        GetJobProfitability(workspaceId),
        GetQuoteStats(workspaceId),
        GetInvoiceStats(workspaceId),
        GetEmployeeStats(workspaceId),
        GetServiceItemsStats(workspaceId),
        GetLeadsByWorkspaceId(workspaceId),
      ]);

      if (customerRes.status === 200) setCustomerStats(customerRes.data);
      if (jobRes.status === 200) setJobStats(jobRes.data.payload);
      if (profitabilityRes.status === 200) setProfitability(profitabilityRes.data.payload);
      if (quoteRes.status === 200) setQuoteStats(quoteRes.data.payload);
      if (invoiceRes.status === 200) setInvoiceStats(invoiceRes.data.payload);
      if (employeeRes.status === 200) setEmployeeStats(employeeRes.data);
      if (serviceItemRes.status === 200)
        setServiceItemStats(serviceItemRes.data);
      if (leadsRes.status === 200) setLeads(leadsRes.data.payload);

      setIsLoading(false);
    };

    fetchAll();
  }, [user?.workspace?.id]);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!user?.workspace?.id) return;
      setIsTrendLoading(true);
      const months = Number(trendRange);
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      start.setMonth(start.getMonth() - (months - 1));
      const end = new Date();
      const startIso = start.toISOString();
      const endIso = end.toISOString();
      const workspaceId = user.workspace.id;

      try {
        const [jobsResponse, quotesResponse, invoicesResponse] =
          await Promise.all([
            GetJobsByFilter(
              workspaceId,
              1,
              1000,
              new URLSearchParams({
                scheduleDateMin: startIso,
                scheduleDateMax: endIso,
              }).toString()
            ),
            GetQuotesByFilter(
              workspaceId,
              1,
              1000,
              new URLSearchParams({
                createdDateMin: startIso,
                createdDateMax: endIso,
              }).toString()
            ),
            GetInvoicesByFilter(
              workspaceId,
              1,
              1000,
              new URLSearchParams({
                dueDateMin: startIso,
                dueDateMax: endIso,
              }).toString()
            ),
          ]);

        if (jobsResponse.status === 200) {
          setTrendJobs(jobsResponse.data.payload.items ?? []);
        }
        if (quotesResponse.status === 200) {
          setTrendQuotes(quotesResponse.data.payload.items ?? []);
        }
        if (invoicesResponse.status === 200) {
          setTrendInvoices(invoicesResponse.data.payload.items ?? []);
        }
      } catch (error) {
        console.error('Failed to load report trend', error);
        setTrendJobs([]);
        setTrendQuotes([]);
        setTrendInvoices([]);
      } finally {
        setIsTrendLoading(false);
      }
    };

    fetchTrend();
  }, [trendRange, user?.workspace?.id]);

  const trendData = useMemo<TTrendPoint[]>(() => {
    const months = Number(trendRange);
    const points: TTrendPoint[] = [];
    const cursor = new Date();
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    cursor.setMonth(cursor.getMonth() - (months - 1));

    for (let index = 0; index < months; index += 1) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const jobs = trendJobs.filter((job) => job.startDateTime?.startsWith(key));
      const quotes = trendQuotes.filter((quote) => quote.createdAt?.startsWith(key));
      const invoices = trendInvoices.filter((invoice) => invoice.dueDate?.startsWith(key));
      const approvedQuotes = quotes.filter(
        (quote) => quote.status === QuoteStatus.Approved || quote.status === QuoteStatus.ConvertedToJob
      ).length;

      points.push({
        month: cursor.toLocaleDateString(undefined, { month: 'short' }),
        revenue: invoices.reduce((sum, invoice) => sum + (invoice.total ?? 0), 0),
        jobs: jobs.length,
        winRate: quotes.length ? (approvedQuotes / quotes.length) * 100 : 0,
      });
      cursor.setMonth(month + 1);
    }

    return points;
  }, [trendInvoices, trendJobs, trendQuotes, trendRange]);

  const netRevenue =
    (invoiceStats?.totalPaidThisMonth ?? 0) + (jobStats?.totalValue ?? 0);

  const conversionPct = Math.min(quoteStats?.conversionRate ?? 0, 100);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64 overflow-y-auto'>
        <Navbar />
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className='px-6 pt-6 pb-10'>
            {/* Header */}
            <div className='pb-4 mb-6'>
              <p className='text-heading text-4xl font-extrabold'>Reports</p>
              <p className='text-gray-600 mt-1'>
                A snapshot of how the business is performing across
                customers, jobs, quotes, and invoices.
              </p>
            </div>

            {/* Headline metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6'>
              <StatCard
                icon={DollarSign}
                iconBg='bg-bg-primary/10'
                iconColor='text-bg-primary'
                label='Revenue (jobs + collected)'
                value={formatCurrency(netRevenue)}
                caption='Job value + paid invoices this month'
              />
              <StatCard
                icon={AlertTriangle}
                iconBg='bg-red-100'
                iconColor='text-red-600'
                label='Outstanding'
                value={formatCurrency(invoiceStats?.totalOutstanding ?? 0)}
                caption={`${invoiceStats?.overdueCount ?? 0} overdue invoice${
                  invoiceStats?.overdueCount === 1 ? '' : 's'
                }`}
              />
              <StatCard
                icon={TrendingUp}
                iconBg='bg-blue-100'
                iconColor='text-blue-600'
                label='Quote conversion'
                value={`${conversionPct.toFixed(0)}%`}
                caption={`${formatCurrency(
                  quoteStats?.approvedValue ?? 0
                )} approved of ${formatCurrency(quoteStats?.totalValue ?? 0)}`}
              />
              <StatCard
                icon={Users}
                iconBg='bg-purple-100'
                iconColor='text-purple-600'
                label='Total customers'
                value={String(customerStats?.total ?? 0)}
                caption={`${customerStats?.newCustomers ?? 0} new this month`}
              />
            </div>

            <SectionCard title='Performance over time' icon={TrendingUp}>
              <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-gray-500'>Revenue, job volume, and quote win rate by month.</p>
                <label className='flex items-center gap-2 text-sm text-gray-600'>
                  <span className='sr-only'>Report date range</span>
                  <select
                    value={trendRange}
                    onChange={(event) => setTrendRange(event.target.value)}
                    className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  >
                    <option value='3'>Last 3 months</option>
                    <option value='6'>Last 6 months</option>
                    <option value='12'>Last 12 months</option>
                  </select>
                </label>
              </div>
              <div className='h-72 w-full'>
                {isTrendLoading ? (
                  <div className='flex h-full items-center justify-center text-sm text-gray-500'>Loading trend...</div>
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                      <YAxis yAxisId='money' tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} />
                      <YAxis yAxisId='percent' orientation='right' domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value, name) => name === 'Revenue' ? formatCurrency(Number(value)) : name === 'Win rate' ? `${Number(value).toFixed(0)}%` : value} />
                      <Legend />
                      <Bar yAxisId='money' dataKey='revenue' name='Revenue' fill='#1f8a70' radius={[3, 3, 0, 0]} />
                      <Line yAxisId='money' type='monotone' dataKey='jobs' name='Jobs' stroke='#2563eb' strokeWidth={2} />
                      <Line yAxisId='percent' type='monotone' dataKey='winRate' name='Win rate' stroke='#9333ea' strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SectionCard>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
              <SectionCard title='Job profitability' icon={BarChart3}>
                <div className='grid grid-cols-3 gap-3'>
                  <div><div className='text-xl font-bold'>{formatCurrency(profitability?.revenue ?? 0)}</div><div className='text-sm text-gray-500'>Revenue</div></div>
                  <div><div className='text-xl font-bold'>{formatCurrency(profitability?.cost ?? 0)}</div><div className='text-sm text-gray-500'>Cost</div></div>
                  <div><div className='text-xl font-bold'>{(profitability?.marginPercent ?? 0).toFixed(1)}%</div><div className='text-sm text-gray-500'>Margin</div></div>
                </div>
                <div className='mt-5 space-y-2'>{(profitability?.byJob ?? []).slice(0, 5).map((job) => <div key={job.id} className='flex justify-between text-sm'><span className='truncate pr-3'>{job.name}</span><span className='font-medium'>{formatCurrency(job.grossProfit)}</span></div>)}</div>
              </SectionCard>
              {/* Jobs */}
              <SectionCard title='Jobs' icon={Briefcase}>
                <div className='grid grid-cols-2 gap-4 mb-5'>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {jobStats?.totalJobs ?? 0}
                    </div>
                    <div className='text-sm text-gray-500'>Total jobs</div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(jobStats?.totalValue ?? 0)}
                    </div>
                    <div className='text-sm text-gray-500'>Combined value</div>
                  </div>
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Completed',
                      value: jobStats?.completedJobs ?? 0,
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Scheduled',
                      value: jobStats?.scheduledJobs ?? 0,
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>

              {/* Quotes */}
              <SectionCard title='Quotes' icon={FileText}>
                <div className='grid grid-cols-2 gap-4 mb-5'>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {quoteStats?.totalQuotes ?? 0}
                    </div>
                    <div className='text-sm text-gray-500'>Total quotes</div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {conversionPct.toFixed(0)}%
                    </div>
                    <div className='text-sm text-gray-500'>
                      Conversion rate
                    </div>
                  </div>
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Approved value',
                      value: Math.round(quoteStats?.approvedValue ?? 0),
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Remaining value',
                      value: Math.max(
                        Math.round(
                          (quoteStats?.totalValue ?? 0) -
                            (quoteStats?.approvedValue ?? 0)
                        ),
                        0
                      ),
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>

              {/* Invoices */}
              <SectionCard title='Invoices' icon={Receipt}>
                <div className='grid grid-cols-2 gap-4 mb-5'>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(invoiceStats?.totalPaidThisMonth ?? 0)}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Paid this month
                    </div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(invoiceStats?.averageInvoiceValue ?? 0)}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Average invoice
                    </div>
                  </div>
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Paid this month',
                      value: Math.round(
                        invoiceStats?.totalPaidThisMonth ?? 0
                      ),
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Outstanding',
                      value: Math.round(invoiceStats?.totalOutstanding ?? 0),
                      colorClass: 'bg-red-300',
                    },
                  ]}
                />
              </SectionCard>

              {/* Customers */}
              <SectionCard title='Customers' icon={Users}>
                <div className='grid grid-cols-2 gap-4 mb-5'>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {customerStats?.total ?? 0}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Total customers
                    </div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {customerStats?.missingInfoCustomers ?? 0}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Missing contact info
                    </div>
                  </div>
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Companies',
                      value: customerStats?.companies ?? 0,
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Individuals',
                      value: customerStats?.individuals ?? 0,
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Leads */}
              <SectionCard title='Leads' icon={TrendingUp}>
                <div className='text-2xl font-bold text-gray-900'>
                  {leads.length}
                </div>
                <div className='text-sm text-gray-500 mb-5'>Total leads</div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Converted',
                      value: leads.filter((l) => l.status === 4).length,
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'In progress',
                      value: leads.filter((l) => l.status !== 4).length,
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>

              {/* Team */}
              <SectionCard title='Team' icon={UserCog}>
                <div className='text-2xl font-bold text-gray-900'>
                  {employeeStats?.totalEmployees ?? 0}
                </div>
                <div className='text-sm text-gray-500 mb-5'>
                  Total team members
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Available',
                      value: employeeStats?.availableEmployees ?? 0,
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Other',
                      value: Math.max(
                        (employeeStats?.activeEmployees ?? 0) -
                          (employeeStats?.availableEmployees ?? 0),
                        0
                      ),
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>

              {/* Pricebook */}
              <SectionCard title='Pricebook' icon={Package}>
                <div className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(serviceItemStats?.totalPricebookValue ?? 0)}
                </div>
                <div className='text-sm text-gray-500 mb-5'>
                  Total pricebook value
                </div>
                <ComparisonBar
                  segments={[
                    {
                      label: 'Services',
                      value: serviceItemStats?.totalServiceItems ?? 0,
                      colorClass: 'bg-bg-primary',
                    },
                    {
                      label: 'Materials',
                      value: serviceItemStats?.totalMaterialItems ?? 0,
                      colorClass: 'bg-gray-300',
                    },
                  ]}
                />
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
