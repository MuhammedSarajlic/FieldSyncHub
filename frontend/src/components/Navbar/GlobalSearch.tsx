import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
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

const getItems = <T,>(response: { data?: { payload?: { items?: T[] } } }) =>
  response.data?.payload?.items ?? [];

const GlobalSearch = () => {
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
    <div className='relative flex-1 max-w-xl mx-3 sm:mx-6'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
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
        }}
        aria-label='Search customers, jobs, quotes and invoices'
        placeholder='Search...'
        className='w-full h-10 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-900'
      />
      {query && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
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
          <div className='absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900'>
            {isLoading ? (
              <div className='px-4 py-4 text-sm text-gray-500'>Searching...</div>
            ) : results.length ? (
              <div className='max-h-96 overflow-y-auto py-1'>
                {results.map((result) => (
                  <button
                    type='button'
                    key={`${result.type}-${result.id}`}
                    onClick={() => selectResult(result)}
                    className='flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
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
                    <span className='ml-3 text-xs text-gray-400'>{result.type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className='px-4 py-4 text-sm text-gray-500'>No matches found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
