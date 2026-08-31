/*
THESIS: Quotes is a working register, not an analytics landing page.
OWN-WORLD: Cool paper surfaces, near-black ink, evergreen actions, amber attention, modest corners, and aligned financial figures.
STORY: See pipeline health, isolate a document state, find a customer, and open or create the next quote without leaving the register.
FIRST VIEWPORT: A compact title/action row, connected four-part summary, then the status rail and quote register.
FORM: The fifth grounded direction, a contractor job-jacket register staged as a document workflow. Seed c321a46d.
*/
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { DateTime } from 'luxon';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Hourglass,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import NewQuoteModal from '../../components/Quotes/QuotesModals/NewQuoteModal';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { useAuth } from '../../context/AuthProvider';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebounce } from '../../hooks/useDebounce';
import {
  GetQuotesByFilter,
  GetQuotesByWorkspace,
  GetQuoteStats,
} from '../../services/Quote';
import { TQuote, TQuoteStats } from '../../types/Quote';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';

type QuotePageData = {
  items: TQuote[];
  totalCount: number;
  pageSize: number;
};

type SortKey = 'customer' | 'created' | 'total';

const statusTabs = [
  { label: 'All quotes', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Awaiting reply', value: 'awaitingResponse' },
  { label: 'Approved', value: 'approved' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
  { label: 'Converted', value: 'convertedToJob' },
];

const statusPresentation: Record<
  QuoteStatus,
  { label: string; className: string; icon: typeof FileText }
> = {
  [QuoteStatus.Draft]: { label: 'Draft', className: 'border-gray-200 bg-gray-100 text-gray-700', icon: FileText },
  [QuoteStatus.Sent]: { label: 'Sent', className: 'border-blue-200 bg-blue-50 text-blue-800', icon: Send },
  [QuoteStatus.AwaitingResponse]: { label: 'Awaiting reply', className: 'border-amber-200 bg-amber-50 text-amber-900', icon: Clock3 },
  [QuoteStatus.AwaitingApproval]: { label: 'Awaiting approval', className: 'border-violet-200 bg-violet-50 text-violet-800', icon: Clock3 },
  [QuoteStatus.Approved]: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  [QuoteStatus.Declined]: { label: 'Declined', className: 'border-red-200 bg-red-50 text-red-800', icon: XCircle },
  [QuoteStatus.Expired]: { label: 'Expired', className: 'border-gray-300 bg-gray-100 text-gray-600', icon: Hourglass },
  [QuoteStatus.ConvertedToJob]: { label: 'Converted', className: 'border-teal-200 bg-teal-50 text-teal-800', icon: BriefcaseBusiness },
};

const Quotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quotes, setQuotes] = useState<TQuote[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(searchValue, 350);
  const filterRef = useClickOutside<HTMLDivElement>(() => setIsFilterOpen(false));

  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const activeStatus = searchParams.get('status') ?? '';
  const sortBy = searchParams.get('sortBy') as SortKey | null;
  const sortDirection = searchParams.get('sort') === 'desc' ? 'desc' : 'asc';

  useEffect(() => {
    setSearchParams((current) => {
      const normalized = debouncedSearch.trim();
      if ((current.get('q') ?? '') === normalized) return current;
      const next = new URLSearchParams(current);
      if (normalized) next.set('q', normalized);
      else next.delete('q');
      next.delete('page');
      return next;
    });
  }, [debouncedSearch, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') setIsNewQuoteModalOpen(true);
  }, [searchParams]);

  const quotesQuery = useQuery<QuotePageData>({
    queryKey: ['quotes', user?.workspace?.id, searchParams.toString()],
    enabled: Boolean(user?.workspace?.id),
    staleTime: 30_000,
    queryFn: async () => {
      const workspaceId = user?.workspace?.id;
      if (!workspaceId) throw new Error('A workspace is required to load quotes.');

      const apiParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key === 'page' || key === 'create' || !value) return;
        if (key === 'createdDateMin' || key === 'createdDateMax') {
          const localDate = DateTime.fromISO(value);
          const utcDate = key === 'createdDateMax' ? localDate.endOf('day').toUTC() : localDate.startOf('day').toUTC();
          apiParams.set(key, utcDate.toISO() ?? value);
          return;
        }
        apiParams.set(key, value);
      });

      const response = apiParams.size > 0
        ? await GetQuotesByFilter(workspaceId, page, 10, apiParams.toString())
        : await GetQuotesByWorkspace(workspaceId, page, 10);

      if (response.status !== 200 || !response.data.payload) throw new Error('Quotes could not be loaded.');
      return response.data.payload as QuotePageData;
    },
  });

  const statsQuery = useQuery<TQuoteStats>({
    queryKey: ['quote-stats', user?.workspace?.id],
    enabled: Boolean(user?.workspace?.id),
    staleTime: 60_000,
    queryFn: async () => {
      const workspaceId = user?.workspace?.id;
      if (!workspaceId) throw new Error('A workspace is required to load quote totals.');
      const response = await GetQuoteStats(workspaceId);
      if (response.status !== 200 || !response.data.payload) throw new Error('Quote totals could not be loaded.');
      return response.data.payload as TQuoteStats;
    },
  });

  useEffect(() => {
    if (quotesQuery.data) {
      setQuotes(quotesQuery.data.items);
      setSelectedIds([]);
    }
  }, [quotesQuery.data]);

  const totalCount = quotesQuery.data?.totalCount ?? 0;
  const pageSize = quotesQuery.data?.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);
  const quoteStats = statsQuery.data;
  const isInitialLoading = quotesQuery.isPending && !quotesQuery.data;
  const filterCount = useMemo(
    () => ['createdDateMin', 'createdDateMax', 'totalMin', 'totalMax'].filter((key) => searchParams.has(key)).length,
    [searchParams]
  );

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) next.delete('page');
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    const direction = sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc';
    updateParams({ sortBy: key, sort: direction });
  };

  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id)
    ? current.filter((selectedId) => selectedId !== id)
    : [...current, id]);
  const toggleAll = () => setSelectedIds((current) => current.length === quotes.length ? [] : quotes.map((quote) => quote.id));

  const exportSelected = () => {
    const selected = quotes.filter((quote) => selectedIds.includes(quote.id));
    const rows = [
      ['Quote number', 'Customer', 'Status', 'Created', 'Expires', 'Total'],
      ...selected.map((quote) => [quote.quoteNumber, getCustomerName(quote), statusPresentation[quote.status]?.label ?? 'Unknown', quote.createdAt, quote.expiresAt, String(quote.total)]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const closeCreateModal = () => {
    setIsNewQuoteModalOpen(false);
    if (searchParams.has('create')) updateParams({ create: null });
    void queryClient.invalidateQueries({ queryKey: ['quotes', user?.workspace?.id] });
    void queryClient.invalidateQueries({ queryKey: ['quote-stats', user?.workspace?.id] });
  };

  return (
    <div className='flex min-h-screen bg-[#f3f6f4] text-[#17211d]'>
      <Sidebar />
      <div className='min-w-0 flex-1 md:ml-64'>
        <Navbar />
        <main id='main-content' className='w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8'>
          <header className='flex flex-col gap-5 border-b border-[#d9e0dc] pb-6 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='mb-2 text-sm font-semibold text-[#456157]'>Sales workspace</p>
              <h1 className='text-3xl font-semibold text-[#14201b]'>Quotes</h1>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-[#5d6b65]'>Prepare estimates, follow customer decisions, and turn approved work into jobs.</p>
            </div>
            <button type='button' onClick={() => setIsNewQuoteModalOpen(true)} className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0d5944] px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,89,68,0.18)] transition-colors hover:bg-[#084936] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] focus-visible:ring-offset-2 sm:w-auto'>
              <Plus className='h-4 w-4' /> Create quote
            </button>
          </header>

          <section aria-label='Quote pipeline summary' className='mt-6 overflow-hidden rounded-lg border border-[#d6ded9] bg-white'>
            <div className='grid grid-cols-2 lg:grid-cols-4'>
              <Metric label='All quotes' value={quoteStats?.totalQuotes ?? 0} icon={FileText} loading={statsQuery.isPending} />
              <Metric label='Pipeline value' value={formatCurrency(quoteStats?.totalValue)} icon={CircleDollarSign} loading={statsQuery.isPending} />
              <Metric label='Approved value' value={formatCurrency(quoteStats?.approvedValue)} icon={FileCheck2} loading={statsQuery.isPending} />
              <Metric label='Conversion rate' value={`${quoteStats?.conversionRate ?? 0}%`} icon={CheckCircle2} loading={statsQuery.isPending} />
            </div>
          </section>

          <section aria-labelledby='quote-register-title' className='relative mt-6 rounded-lg border border-[#d6ded9] bg-white'>
            <div className='border-b border-[#dfe5e1] px-4 pt-4 sm:px-5'>
              <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
                <div>
                  <h2 id='quote-register-title' className='text-base font-semibold text-[#18231e]'>Quote register</h2>
                  <p className='mt-1 text-sm text-[#68756f]'>Every estimate in this workspace, from draft to converted job.</p>
                </div>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                  <label htmlFor='quote-search' className='relative block min-w-0 sm:w-72'>
                    <span className='sr-only'>Search quotes by customer</span>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#708079]' />
                    <input id='quote-search' type='search' value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder='Search customer name' className='h-10 w-full rounded-lg border border-[#cbd5d0] bg-white pl-9 pr-9 text-sm text-[#17211d] outline-none placeholder:text-[#819089] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15' />
                    {searchValue && <button type='button' onClick={() => setSearchValue('')} aria-label='Clear quote search' className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#708079] hover:bg-[#eef2ef] hover:text-[#17211d]'><X className='h-4 w-4' /></button>}
                  </label>

                  <div ref={filterRef} className='relative'>
                    <button type='button' onClick={() => setIsFilterOpen((open) => !open)} aria-expanded={isFilterOpen} className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cbd5d0] bg-white px-3 text-sm font-medium text-[#314139] hover:bg-[#f5f7f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30 sm:w-auto'>
                      <Filter className='h-4 w-4' /> Filters
                      {filterCount > 0 && <span className='rounded-full bg-[#0d5944] px-1.5 py-0.5 text-[11px] font-bold text-white'>{filterCount}</span>}
                    </button>
                    {isFilterOpen && <QuoteFilterPanel searchParams={searchParams} onApply={(filters) => { updateParams(filters); setIsFilterOpen(false); }} onClose={() => setIsFilterOpen(false)} />}
                  </div>
                </div>
              </div>

              <nav aria-label='Quote status' className='mt-5 flex gap-1 overflow-x-auto pb-px'>
                {statusTabs.map((tab) => {
                  const active = activeStatus.toLowerCase() === tab.value.toLowerCase();
                  return <button key={tab.label} type='button' onClick={() => updateParams({ status: tab.value || null })} aria-current={active ? 'page' : undefined} className={`relative shrink-0 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0d5944] ${active ? 'text-[#0d5944]' : 'text-[#637169] hover:text-[#17211d]'}`}>
                    {tab.label}{active && <span className='absolute inset-x-2 bottom-0 h-0.5 bg-[#0d5944]' />}
                  </button>;
                })}
              </nav>
            </div>

            {selectedIds.length > 0 && <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e0db] bg-[#edf5f1] px-4 py-3 sm:px-5'>
              <p className='text-sm font-semibold text-[#174d3c]'>{selectedIds.length} selected</p>
              <div className='flex items-center gap-2'>
                <button type='button' onClick={exportSelected} className='inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[#174d3c] hover:bg-white'><Download className='h-4 w-4' /> Export CSV</button>
                <button type='button' onClick={() => setSelectedIds([])} aria-label='Clear quote selection' className='rounded-md p-1.5 text-[#456157] hover:bg-white'><X className='h-4 w-4' /></button>
              </div>
            </div>}

            {quotesQuery.isError ? <ErrorState onRetry={() => void quotesQuery.refetch()} /> : isInitialLoading ? <QuoteTableSkeleton /> : quotes.length === 0 ? (
              <EmptyState filtered={Boolean(searchValue || activeStatus || filterCount)} onClear={() => { setSearchValue(''); setSearchParams({}); }} onCreate={() => setIsNewQuoteModalOpen(true)} />
            ) : <>
              <div className='hidden overflow-x-auto md:block'>
                <table className='w-full min-w-[940px] border-collapse'>
                  <thead><tr className='border-b border-[#dfe5e1] bg-[#f7f9f8] text-left text-xs font-semibold text-[#617068]'>
                    <th className='w-12 px-4 py-3'><input type='checkbox' checked={quotes.length > 0 && selectedIds.length === quotes.length} onChange={toggleAll} aria-label='Select all quotes on this page' className='h-4 w-4 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' /></th>
                    <SortableHeader label='Quote' sortKey='customer' currentKey={sortBy} direction={sortDirection} onSort={handleSort} />
                    <th className='px-4 py-3'>Service address</th>
                    <SortableHeader label='Created' sortKey='created' currentKey={sortBy} direction={sortDirection} onSort={handleSort} />
                    <th className='px-4 py-3'>Follow-up</th><th className='px-4 py-3'>Status</th>
                    <SortableHeader label='Total' sortKey='total' currentKey={sortBy} direction={sortDirection} onSort={handleSort} align='right' />
                    <th className='w-12 px-3 py-3'><span className='sr-only'>Open</span></th>
                  </tr></thead>
                  <tbody className='divide-y divide-[#e6ebe8]'>{quotes.map((quote) => <QuoteTableRow key={quote.id} quote={quote} selected={selectedIds.includes(quote.id)} onToggle={() => toggleSelected(quote.id)} />)}</tbody>
                </table>
              </div>
              <div className='divide-y divide-[#dfe5e1] md:hidden'>{quotes.map((quote) => <QuoteMobileRow key={quote.id} quote={quote} selected={selectedIds.includes(quote.id)} onToggle={() => toggleSelected(quote.id)} />)}</div>
              <footer className='flex flex-col gap-3 border-t border-[#dfe5e1] bg-[#fafbfa] px-4 py-3 text-sm text-[#65736c] sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                <span>Showing <strong className='font-semibold text-[#25332c]'>{rangeStart}-{rangeEnd}</strong> of <strong className='font-semibold text-[#25332c]'>{totalCount}</strong></span>
                <div className='flex items-center justify-between gap-2 sm:justify-end'>
                  <button type='button' disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })} className='inline-flex h-9 items-center gap-1 rounded-md border border-[#cbd5d0] bg-white px-3 font-medium text-[#34443c] hover:bg-[#f2f5f3] disabled:cursor-not-allowed disabled:opacity-40'><ChevronLeft className='h-4 w-4' /> Previous</button>
                  <span className='px-2 text-xs font-semibold'>Page {page} of {totalPages}</span>
                  <button type='button' disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })} className='inline-flex h-9 items-center gap-1 rounded-md border border-[#cbd5d0] bg-white px-3 font-medium text-[#34443c] hover:bg-[#f2f5f3] disabled:cursor-not-allowed disabled:opacity-40'>Next <ChevronRight className='h-4 w-4' /></button>
                </div>
              </footer>
            </>}
          </section>
        </main>
      </div>
      <NewQuoteModal isOpen={isNewQuoteModalOpen} onClose={closeCreateModal} setQuotes={setQuotes} />
    </div>
  );
};

const Metric = ({ label, value, icon: Icon, loading }: { label: string; value: string | number; icon: typeof FileText; loading: boolean }) => (
  <div className='min-w-0 border-b border-r border-[#e1e7e3] p-4 last:border-r-0 even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0 sm:p-5'>
    <div className='flex items-center gap-2 text-sm font-medium text-[#65736c]'><Icon className='h-4 w-4 text-[#456157]' /><span>{label}</span></div>
    {loading ? <div className='mt-3 h-7 w-24 animate-pulse rounded bg-[#e8eeea]' /> : <p className='mt-2 truncate text-2xl font-semibold tabular-nums text-[#17211d]'>{value}</p>}
  </div>
);

const SortableHeader = ({ label, sortKey, currentKey, direction, onSort, align = 'left' }: { label: string; sortKey: SortKey; currentKey: SortKey | null; direction: 'asc' | 'desc'; onSort: (key: SortKey) => void; align?: 'left' | 'right' }) => {
  const active = currentKey === sortKey;
  const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;
  return <th className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''}`}><button type='button' onClick={() => onSort(sortKey)} className={`inline-flex items-center gap-1.5 rounded-sm hover:text-[#0d5944] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] ${align === 'right' ? 'ml-auto' : ''}`}>{label}<Icon className='h-3.5 w-3.5' /></button></th>;
};

const QuoteTableRow = ({ quote, selected, onToggle }: { quote: TQuote; selected: boolean; onToggle: () => void }) => {
  const status = statusPresentation[quote.status] ?? statusPresentation[QuoteStatus.Draft];
  const StatusIcon = status.icon;
  const followUp = getFollowUp(quote);
  return <tr className={`group transition-colors hover:bg-[#f7faf8] ${selected ? 'bg-[#f0f7f3]' : 'bg-white'}`}>
    <td className='px-4 py-4'><input type='checkbox' checked={selected} onChange={onToggle} aria-label={`Select quote ${quote.quoteNumber}`} className='h-4 w-4 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' /></td>
    <td className='px-4 py-4'><Link to={`/quotes/${quote.id}`} className='font-semibold text-[#17211d] hover:text-[#0d5944] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'>{getCustomerName(quote)}</Link><p className='mt-1 text-xs font-medium text-[#718078]'>#{quote.quoteNumber}</p></td>
    <td className='max-w-[220px] px-4 py-4 text-sm text-[#536159]'><span className='line-clamp-2'>{quote.property?.address || 'No service address'}</span></td>
    <td className='whitespace-nowrap px-4 py-4 text-sm text-[#536159]'>{formatDate(quote.createdAt)}</td>
    <td className='whitespace-nowrap px-4 py-4'><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${followUp.attention ? 'text-amber-800' : 'text-[#637169]'}`}>{followUp.attention && <AlertCircle className='h-3.5 w-3.5' />}{followUp.label}</span></td>
    <td className='px-4 py-4'><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}><StatusIcon className='h-3.5 w-3.5' /> {status.label}</span></td>
    <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold tabular-nums text-[#17211d]'>{formatCurrency(quote.total)}</td>
    <td className='px-3 py-4 text-right'><Link to={`/quotes/${quote.id}`} aria-label={`Open quote ${quote.quoteNumber}`} className='inline-flex rounded-md p-1.5 text-[#6c7a73] hover:bg-[#eaf1ed] hover:text-[#0d5944] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'><ChevronRight className='h-4 w-4' /></Link></td>
  </tr>;
};

const QuoteMobileRow = ({ quote, selected, onToggle }: { quote: TQuote; selected: boolean; onToggle: () => void }) => {
  const status = statusPresentation[quote.status] ?? statusPresentation[QuoteStatus.Draft];
  const StatusIcon = status.icon;
  const followUp = getFollowUp(quote);
  return <article className={`p-4 ${selected ? 'bg-[#f0f7f3]' : 'bg-white'}`}><div className='flex items-start gap-3'>
    <input type='checkbox' checked={selected} onChange={onToggle} aria-label={`Select quote ${quote.quoteNumber}`} className='mt-1 h-4 w-4 shrink-0 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' />
    <div className='min-w-0 flex-1'><div className='flex items-start justify-between gap-3'><div className='min-w-0'><Link to={`/quotes/${quote.id}`} className='block truncate font-semibold text-[#17211d] hover:text-[#0d5944] hover:underline'>{getCustomerName(quote)}</Link><p className='mt-1 text-xs font-medium text-[#718078]'>#{quote.quoteNumber} · {formatDate(quote.createdAt)}</p></div><p className='shrink-0 font-semibold tabular-nums text-[#17211d]'>{formatCurrency(quote.total)}</p></div>
      <p className='mt-3 truncate text-sm text-[#58665f]'>{quote.property?.address || 'No service address'}</p>
      <div className='mt-3 flex flex-wrap items-center justify-between gap-2'><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}><StatusIcon className='h-3.5 w-3.5' /> {status.label}</span><span className={`inline-flex items-center gap-1 text-xs font-medium ${followUp.attention ? 'text-amber-800' : 'text-[#637169]'}`}>{followUp.attention && <AlertCircle className='h-3.5 w-3.5' />}{followUp.label}</span></div>
    </div>
  </div></article>;
};

const QuoteFilterPanel = ({ searchParams, onApply, onClose }: { searchParams: URLSearchParams; onApply: (filters: Record<string, string | null>) => void; onClose: () => void }) => {
  const [createdMin, setCreatedMin] = useState(searchParams.get('createdDateMin') ?? '');
  const [createdMax, setCreatedMax] = useState(searchParams.get('createdDateMax') ?? '');
  const [totalMin, setTotalMin] = useState(searchParams.get('totalMin') ?? '');
  const [totalMax, setTotalMax] = useState(searchParams.get('totalMax') ?? '');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const submit = (event: FormEvent) => { event.preventDefault(); onApply({ createdDateMin: createdMin || null, createdDateMax: createdMax || null, totalMin: totalMin || null, totalMax: totalMax || null }); };
  const activeCount = [createdMin, createdMax, totalMin, totalMax].filter(Boolean).length;
  const fieldClass = 'mt-1.5 h-11 w-full rounded-md border border-[#cbd5d0] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#8b9992] hover:border-[#aebbb4] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15';

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-[#17211d]/20 px-4 py-5 sm:px-6 sm:py-8'>
      <button type='button' onClick={onClose} aria-label='Close filters' className='absolute inset-0 h-full w-full cursor-default' />
      <div className='relative z-10 flex min-h-full items-start justify-center sm:pt-8 lg:justify-end lg:pr-8'>
        <form
          onSubmit={submit}
          role='dialog'
          aria-modal='true'
          aria-labelledby='quote-filter-title'
          className='flex max-h-[calc(100vh-2.5rem)] w-full max-w-[30rem] flex-col overflow-hidden rounded-lg border border-[#cfd8d3] bg-white shadow-[0_18px_48px_rgba(23,33,29,0.2)] sm:max-h-[calc(100vh-4rem)]'
        >
          <div className='flex items-start justify-between border-b border-[#dfe5e1] px-5 py-5'>
            <div className='flex items-start gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e9f1ed] text-[#0d5944]'>
                <Filter className='h-4 w-4' />
              </span>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 id='quote-filter-title' className='text-base font-semibold text-[#17211d]'>Filter quotes</h3>
                  {activeCount > 0 && <span className='rounded-full bg-[#e9f1ed] px-2 py-0.5 text-[11px] font-bold text-[#0d5944]'>{activeCount} active</span>}
                </div>
                <p className='mt-1 text-sm leading-5 text-[#68756f]'>Refine the register by when a quote was created or what it is worth.</p>
              </div>
            </div>
            <button type='button' onClick={onClose} aria-label='Close filters' className='-mr-1 -mt-1 rounded-md p-2 text-[#69776f] transition hover:bg-[#f0f3f1] hover:text-[#17211d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30'>
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto px-5 py-5'>
            <fieldset>
              <legend className='text-sm font-semibold text-[#24332c]'>Created date</legend>
              <p className='mt-1 text-xs leading-5 text-[#718078]'>Show quotes created within a specific time window.</p>
              <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <label htmlFor='quote-created-from' className='text-xs font-semibold text-[#536159]'>
                  From
                  <input id='quote-created-from' type='date' value={createdMin} onChange={(event) => setCreatedMin(event.target.value)} className={fieldClass} />
                </label>
                <label htmlFor='quote-created-to' className='text-xs font-semibold text-[#536159]'>
                  To
                  <input id='quote-created-to' type='date' value={createdMax} onChange={(event) => setCreatedMax(event.target.value)} className={fieldClass} />
                </label>
              </div>
            </fieldset>

            <fieldset className='mt-7 border-t border-[#e0e6e2] pt-6'>
              <legend className='text-sm font-semibold text-[#24332c]'>Total value</legend>
              <p className='mt-1 text-xs leading-5 text-[#718078]'>Keep only quotes within your target deal size.</p>
              <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <label htmlFor='quote-total-min' className='text-xs font-semibold text-[#536159]'>
                  Minimum
                  <input id='quote-total-min' type='number' min='0' step='0.01' value={totalMin} onChange={(event) => setTotalMin(event.target.value)} placeholder='0.00' className={fieldClass} />
                </label>
                <label htmlFor='quote-total-max' className='text-xs font-semibold text-[#536159]'>
                  Maximum
                  <input id='quote-total-max' type='number' min='0' step='0.01' value={totalMax} onChange={(event) => setTotalMax(event.target.value)} placeholder='Any amount' className={fieldClass} />
                </label>
              </div>
            </fieldset>
          </div>

          <div className='flex flex-col-reverse gap-2 border-t border-[#dfe5e1] bg-[#fafbfa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <button type='button' onClick={() => onApply({ createdDateMin: null, createdDateMax: null, totalMin: null, totalMax: null })} className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-semibold text-[#596860] transition hover:bg-white hover:text-[#17211d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30 sm:justify-start'>
              Clear all
            </button>
            <div className='flex gap-2'>
              <button type='button' onClick={onClose} className='h-10 flex-1 rounded-md border border-[#cbd5d0] bg-white px-4 text-sm font-semibold text-[#34443c] transition hover:bg-[#f3f6f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30 sm:flex-none'>
                Cancel
              </button>
              <button type='submit' className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0d5944] px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,89,68,0.18)] transition hover:bg-[#084936] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] focus-visible:ring-offset-2 sm:flex-none'>
                <Check className='h-4 w-4' /> Apply filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuoteTableSkeleton = () => <div aria-label='Loading quotes' aria-busy='true' className='divide-y divide-[#e4e9e6]'>{Array.from({ length: 7 }).map((_, index) => <div key={index} className='grid grid-cols-[2fr_1.4fr_1fr_1fr] gap-5 px-5 py-5'><div className='h-4 animate-pulse rounded bg-[#e7ece9]' /><div className='h-4 animate-pulse rounded bg-[#edf1ef]' /><div className='h-4 animate-pulse rounded bg-[#edf1ef]' /><div className='h-4 animate-pulse rounded bg-[#e7ece9]' /></div>)}</div>;

const ErrorState = ({ onRetry }: { onRetry: () => void }) => <div className='flex flex-col items-center px-5 py-16 text-center'><span className='flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700'><AlertCircle className='h-5 w-5' /></span><h3 className='mt-4 font-semibold text-[#17211d]'>Quotes could not be loaded</h3><p className='mt-1 max-w-md text-sm text-[#65736c]'>Check your connection and try loading the register again.</p><button type='button' onClick={onRetry} className='mt-5 inline-flex items-center gap-2 rounded-md border border-[#cbd5d0] px-3 py-2 text-sm font-semibold text-[#34443c] hover:bg-[#f3f6f4]'><RefreshCw className='h-4 w-4' /> Try again</button></div>;

const EmptyState = ({ filtered, onClear, onCreate }: { filtered: boolean; onClear: () => void; onCreate: () => void }) => <div className='flex flex-col items-center px-5 py-16 text-center'><span className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#e9f1ed] text-[#0d5944]'><FileText className='h-6 w-6' /></span><h3 className='mt-4 font-semibold text-[#17211d]'>{filtered ? 'No quotes match this view' : 'Create your first quote'}</h3><p className='mt-1 max-w-md text-sm leading-6 text-[#65736c]'>{filtered ? 'Adjust the status, search, or value filters to see more results.' : 'Build a clear estimate for a customer, send it for approval, and convert accepted work into a job.'}</p><button type='button' onClick={filtered ? onClear : onCreate} className='mt-5 inline-flex items-center gap-2 rounded-md bg-[#0d5944] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084936]'>{filtered ? <X className='h-4 w-4' /> : <Plus className='h-4 w-4' />}{filtered ? 'Clear filters' : 'Create quote'}</button></div>;

const getCustomerName = (quote: TQuote) => {
  const customer = quote.customer;
  if (!customer) return 'Customer unavailable';
  if (customer.isCompany && customer.companyName) return customer.companyName;
  return customer.fullName || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || 'Customer unavailable';
};

const getFollowUp = (quote: TQuote) => {
  if (quote.status === QuoteStatus.ConvertedToJob) return { label: 'Job created', attention: false };
  if (quote.status === QuoteStatus.Approved) return { label: 'Ready to schedule', attention: true };
  if (quote.status === QuoteStatus.Declined) return { label: 'Closed', attention: false };
  if (!quote.expiresAt) return { label: 'No expiry', attention: false };
  const days = Math.ceil((new Date(quote.expiresAt).getTime() - Date.now()) / 86_400_000);
  if (quote.status === QuoteStatus.Expired || days < 0) return { label: 'Expired', attention: true };
  if (quote.status === QuoteStatus.Draft) return { label: 'Not sent', attention: false };
  if (days === 0) return { label: 'Expires today', attention: true };
  if (days <= 3) return { label: `Expires in ${days}d`, attention: true };
  return { label: `Expires ${formatDate(quote.expiresAt)}`, attention: false };
};

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';
const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

export default Quotes;
