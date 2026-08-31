import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Receipt,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { GetCustomersByFilter } from '../../services/Customer';
import { GetJobsByFilter } from '../../services/Job';
import { GetQuotesByFilter } from '../../services/Quote';
import { GetInvoicesByFilter } from '../../services/Invoice';
import { useAuth } from '../../context/AuthProvider';
import { TCustomer } from '../../types/Customer';
import { TJob } from '../../types/Job';
import { TQuote } from '../../types/Quote';
import { TInvoice } from '../../types/Invoice';

type SearchResult = {
  id: string;
  label: string;
  detail?: string;
  type: 'Customer' | 'Job' | 'Quote' | 'Invoice';
  path: string;
};

interface GlobalSearchProps {
  className?: string;
}

const getItems = <T,>(response: { data?: { payload?: { items?: T[] } } }) =>
  response.data?.payload?.items ?? [];

const resultIconByType = {
  Customer: Users,
  Job: BriefcaseBusiness,
  Quote: FileText,
  Invoice: Receipt,
};

const GlobalSearch = ({ className = '' }: GlobalSearchProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!user?.workspace?.id || trimmedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      const params = new URLSearchParams({ q: trimmedQuery }).toString();

      try {
        const [customers, jobs, quotes, invoices] = await Promise.all([
          GetCustomersByFilter(user.workspace!.id, 1, 5, params),
          GetJobsByFilter(user.workspace!.id, 1, 5, params),
          GetQuotesByFilter(user.workspace!.id, 1, 5, params),
          GetInvoicesByFilter(user.workspace!.id, 1, 5, params),
        ]);

        if (cancelled) return;

        const customerResults = getItems<TCustomer>(customers).map((item) => ({
          id: item.id,
          label: item.displayName || item.fullName,
          detail: item.companyName || item.emails?.[0],
          type: 'Customer' as const,
          path: `/customers/${item.id}`,
        }));
        const jobResults = getItems<TJob>(jobs).map((item) => ({
          id: item.id,
          label: item.title,
          detail: item.jobNumber,
          type: 'Job' as const,
          path: `/jobs/${item.id}`,
        }));
        const quoteResults = getItems<TQuote>(quotes).map((item) => ({
          id: item.id,
          label: item.title,
          detail: item.quoteNumber,
          type: 'Quote' as const,
          path: `/quotes/${item.id}`,
        }));
        const invoiceResults = getItems<TInvoice>(invoices).map((item) => ({
          id: item.id,
          label: item.title,
          detail: item.invoiceNumber,
          type: 'Invoice' as const,
          path: `/invoices/${item.id}`,
        }));

        setResults([
          ...customerResults,
          ...jobResults,
          ...quoteResults,
          ...invoiceResults,
        ]);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, user?.workspace?.id]);

  const selectResult = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(result.path);
  };

  return (
    <div
      className={`relative w-full ${
        isOpen && query.trim().length >= 2 ? 'z-30' : ''
      } ${className}`}
    >
      <Search className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted' />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setQuery('');
            setIsOpen(false);
            inputRef.current?.blur();
          }
          if (event.key === 'Enter' && results[0]) selectResult(results[0]);
        }}
        role='combobox'
        aria-autocomplete='list'
        aria-haspopup='listbox'
        aria-expanded={isOpen && query.trim().length >= 2}
        aria-controls='global-search-results'
        aria-label='Search customers, jobs, quotes and invoices'
        placeholder='Search customers, jobs, quotes...'
        className='h-10 w-full rounded-md border border-border-primary bg-white pl-10 pr-20 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-gray-300 focus:border-bg-primary focus:ring-2 focus:ring-bg-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40'
      />
      {!query && (
        <span className='pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border-primary bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:inline-flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'>
          Ctrl K
        </span>
      )}
      {query && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition hover:bg-surface-subtle hover:text-text-primary dark:hover:bg-gray-800 dark:hover:text-gray-100'
        >
          <X className='w-4 h-4' />
        </button>
      )}
      {isOpen && query.trim().length >= 2 && (
        <>
          <button
            type='button'
            aria-label='Close search results'
            className='fixed inset-0 z-20 cursor-default'
            onClick={() => setIsOpen(false)}
          />
          <div
            id='global-search-results'
            role='listbox'
            className='absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-border-primary bg-white shadow-[0_14px_36px_rgba(23,33,29,0.14)] dark:border-gray-700 dark:bg-gray-900'
          >
            {isLoading ? (
              <div className='flex items-center gap-3 px-4 py-5 text-sm text-text-muted dark:text-gray-400'>
                <span className='h-4 w-4 animate-spin rounded-full border-2 border-border-primary border-t-bg-primary' />
                Searching your workspace...
              </div>
            ) : results.length ? (
              <div className='max-h-96 overflow-y-auto py-1'>
                {results.map((result) => (
                  <button
                    type='button'
                    role='option'
                    aria-selected='false'
                    key={`${result.type}-${result.id}`}
                    onClick={() => selectResult(result)}
                    className='flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none dark:hover:bg-gray-800 dark:focus:bg-gray-800'
                  >
                    <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-bg-primary dark:bg-gray-800 dark:text-emerald-300'>
                      {(() => {
                        const Icon = resultIconByType[result.type];
                        return <Icon className='h-4 w-4' />;
                      })()}
                    </span>
                    <span className='min-w-0'>
                      <span className='block truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {result.label}
                      </span>
                      {result.detail && (
                        <span className='block truncate text-xs text-gray-500'>
                          {result.detail}
                        </span>
                      )}
                    </span>
                    <span className='ml-auto flex shrink-0 items-center gap-1.5 pl-3 text-xs text-text-muted dark:text-gray-500'>
                      {result.type}
                      <ArrowUpRight className='h-3.5 w-3.5' />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className='px-4 py-5 text-sm text-text-muted dark:text-gray-400'>
                No matches found in this workspace.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
