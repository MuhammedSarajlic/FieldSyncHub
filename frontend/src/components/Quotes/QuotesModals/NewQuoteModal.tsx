import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Percent,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserRound,
  X,
} from 'lucide-react';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { QuoteStatus } from '../../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { useAuth } from '../../../context/AuthProvider';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useDebounce } from '../../../hooks/useDebounce';
import { GetCustomerByWorkspace } from '../../../services/Customer';
import { GetEmployeesByWorkspace } from '../../../services/Employee';
import { CreateQuote } from '../../../services/Quote';
import { GetServiceItemsByFilter } from '../../../services/ServiceItem';
import { TCustomer } from '../../../types/Customer';
import { TEmployee } from '../../../types/Employee';
import { TAddLineItem } from '../../../types/LineItem';
import { TAddQuote, TQuote } from '../../../types/Quote';
import { TServiceItem } from '../../../types/ServiceItem';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import Modal from '../../CustomElements/Modal';

interface INewQuoteModal {
  isOpen?: boolean;
  onClose: () => void;
  setQuotes: React.Dispatch<React.SetStateAction<TQuote[]>>;
}

const fieldClass = 'h-10 w-full rounded-md border border-[#cbd5d0] bg-white px-3 text-sm text-[#17211d] outline-none placeholder:text-[#829088] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15 disabled:cursor-not-allowed disabled:bg-[#f1f4f2] disabled:text-[#829088]';
const textareaClass = 'w-full rounded-md border border-[#cbd5d0] bg-white px-3 py-2.5 text-sm text-[#17211d] outline-none placeholder:text-[#829088] focus:border-[#0d5944] focus:ring-2 focus:ring-[#0d5944]/15';
const toDisplayTaxRate = (rate = 0) => rate > 1 ? rate : rate * 100;

const makeInitialQuote = (userId = '', defaultTaxRate = 0): TAddQuote => ({
  workspaceId: '',
  customerId: '',
  createdByUserId: '',
  assignedToUserId: userId,
  status: QuoteStatus.Draft,
  title: '',
  propertyId: '',
  lineItems: [makeLineItem()],
  discountType: DiscountType.Percentage,
  discountValue: 0,
  taxRate: toDisplayTaxRate(defaultTaxRate),
  customerNotes: [{ createdBy: '', createdByName: '', noteText: '' }],
  internalNotes: [{ createdBy: '', createdByName: '', noteText: '' }],
  activityHistory: [],
  source: '',
});

const makeLineItem = (isOptional = false): TAddLineItem => ({
  quantity: 1,
  name: '',
  unitPrice: 0,
  description: '',
  isOptional,
  isTaxable: false,
});

const NewQuoteModal = ({ isOpen = false, onClose, setQuotes }: INewQuoteModal) => {
  const { user } = useAuth();
  const [quote, setQuote] = useState<TAddQuote>(() => makeInitialQuote(user?.id, user?.workspace?.defaultTaxRate));
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<TEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [assigneeName, setAssigneeName] = useState(user?.fullName ?? '');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 250);
  const assigneeRef = useClickOutside<HTMLDivElement>(() => setIsAssigneeOpen(false));

  const [serviceResults, setServiceResults] = useState<TServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const debouncedServiceSearch = useDebounce(serviceSearch, 250);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedCustomer = customers.find((customer) => customer.id === quote.customerId);
  const selectedProperty = selectedCustomer?.properties?.find((property) => property.id === quote.propertyId);
  const totals = calculateTotals(quote);

  useEffect(() => {
    if (!isOpen || !user?.workspace) return;
    let active = true;
    setCustomersLoading(true);
    GetCustomerByWorkspace(user.workspace.id, 1, 100)
      .then((response) => {
        if (active && response.status === 200) setCustomers(response.data.payload.items);
      })
      .catch(() => {
        if (active) setSubmitError('Customers could not be loaded. Close the quote and try again.');
      })
      .finally(() => {
        if (active) setCustomersLoading(false);
      });
    return () => { active = false; };
  }, [isOpen, user?.workspace?.id]);

  useEffect(() => {
    if (!isOpen || !user) return;
    setQuote((current) => {
      if (current.customerId || current.title || current.lineItems.some((item) => item.name)) return current;
      return makeInitialQuote(user.id, user.workspace?.defaultTaxRate ?? 0);
    });
    setAssigneeName((current) => current || user.fullName);
  }, [isOpen, user]);

  useEffect(() => {
    const normalized = debouncedEmployeeSearch.trim().toLowerCase();
    setFilteredEmployees(normalized
      ? employees.filter((employee) => employee.user.fullName.toLowerCase().includes(normalized) || employee.user.email.toLowerCase().includes(normalized))
      : employees);
  }, [debouncedEmployeeSearch, employees]);

  useEffect(() => {
    if (!debouncedServiceSearch.trim() || activeLineIndex === null || !user?.workspace) {
      setServiceResults([]);
      return;
    }
    let active = true;
    GetServiceItemsByFilter(user.workspace.id, 1, 8, `q=${encodeURIComponent(debouncedServiceSearch.trim())}`)
      .then((response) => {
        if (active && response.status === 200) setServiceResults(response.data.payload.items.slice(0, 6));
      })
      .catch(() => {
        if (active) setServiceResults([]);
      });
    return () => { active = false; };
  }, [activeLineIndex, debouncedServiceSearch, user?.workspace?.id]);

  const updateQuoteField = (name: keyof TAddQuote, value: string | number) => {
    setQuote((current) => ({ ...current, [name]: value }));
    setSubmitError('');
  };

  const updateLineItem = (index: number, field: keyof TAddLineItem, value: string | number | boolean) => {
    setQuote((current) => {
      const lineItems = [...current.lineItems];
      const existing = lineItems[index];
      const clearPricebookLink = existing.serviceItemId && ((field === 'name' && value !== existing.name) || (field === 'unitPrice' && value !== existing.unitPrice));
      lineItems[index] = { ...existing, [field]: value, ...(clearPricebookLink ? { serviceItemId: undefined } : {}) } as TAddLineItem;
      return { ...current, lineItems };
    });
    setSubmitError('');
  };

  const addLineItem = (isOptional = false) => {
    setQuote((current) => ({ ...current, lineItems: [...current.lineItems, makeLineItem(isOptional)] }));
  };

  const removeLineItem = (index: number) => {
    setQuote((current) => ({ ...current, lineItems: current.lineItems.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const chooseServiceItem = (index: number, service: TServiceItem) => {
    setQuote((current) => {
      const lineItems = [...current.lineItems];
      lineItems[index] = {
        ...lineItems[index],
        serviceItemId: service.id,
        name: service.name,
        description: service.description,
        unitPrice: service.unitPrice,
        cost: service.cost,
        isTaxable: service.isTaxable,
      };
      return { ...current, lineItems };
    });
    setServiceSearch('');
    setServiceResults([]);
    setActiveLineIndex(null);
  };

  const loadEmployees = async () => {
    if (!user?.workspace || employees.length > 0) return;
    setEmployeesLoading(true);
    try {
      const response = await GetEmployeesByWorkspace(user.workspace.id);
      if (response.status === 200) {
        setEmployees(response.data.payload);
        setFilteredEmployees(response.data.payload);
      }
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitError('');
    setIsAssigneeOpen(false);
    setActiveLineIndex(null);
    setQuote(makeInitialQuote(user?.id, user?.workspace?.defaultTaxRate ?? 0));
    setAssigneeName(user?.fullName ?? '');
    onClose();
  };

  const handleCreateQuote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.workspace) {
      setSubmitError('Your workspace is not available. Refresh the page and try again.');
      return;
    }
    if (!quote.customerId) {
      setSubmitError('Choose a customer before creating the quote.');
      document.getElementById('new-quote-customer')?.focus();
      return;
    }
    if (!quote.propertyId) {
      setSubmitError('Choose the service address for this quote.');
      document.getElementById('new-quote-property')?.focus();
      return;
    }
    if (!quote.title.trim()) {
      setSubmitError('Add a clear quote title.');
      document.getElementById('new-quote-title')?.focus();
      return;
    }
    const invalidLine = quote.lineItems.findIndex((item) => !item.name.trim() || item.quantity <= 0);
    if (invalidLine >= 0) {
      setSubmitError(`Complete the name and quantity for line item ${invalidLine + 1}.`);
      document.getElementById(`new-quote-item-${invalidLine}`)?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await CreateQuote({
        ...quote,
        workspaceId: user.workspace.id,
        createdByUserId: user.id,
        taxRate: quote.taxRate / 100,
        customerNotes: quote.customerNotes.filter((note) => note.noteText?.trim()),
        internalNotes: quote.internalNotes.filter((note) => note.noteText?.trim()),
      });
      if (response.status === 200) {
        setQuotes((current) => [response.data, ...current]);
        handleClose();
        return;
      }
      setSubmitError(response.data?.message ?? 'The quote could not be created. Try again.');
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setSubmitError(message ?? 'The quote could not be created. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNote = (name: 'internalNotes' | 'customerNotes', value: string) => {
    if (!user) return;
    setQuote((current) => ({
      ...current,
      [name]: [{
        createdBy: user.id,
        createdByName: user.fullName,
        noteText: value,
        customerId: selectedCustomer?.id ?? '',
      }],
    }));
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title='Create quote'
      labelledBy='new-quote-dialog-label'
      className='flex h-[min(900px,calc(100vh-2rem))] max-w-[1180px] flex-col !overflow-hidden'
    >
      <header className='flex shrink-0 items-start justify-between border-b border-[#d9e0dc] bg-white px-5 py-4 sm:px-7'>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e8f1ed] text-[#0d5944]'>
            <FileText className='h-5 w-5' />
          </span>
          <div>
            <h2 className='text-xl font-semibold text-[#17211d]'>Create quote</h2>
            <p className='mt-1 text-sm text-[#65736c]'>Prepare a draft estimate. You can review and send it after saving.</p>
          </div>
        </div>
        <button type='button' onClick={handleClose} aria-label='Close create quote' className='ml-4 rounded-md p-2 text-[#65736c] hover:bg-[#f0f3f1] hover:text-[#17211d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]'>
          <X className='h-5 w-5' />
        </button>
      </header>

      <form onSubmit={handleCreateQuote} className='flex min-h-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='grid min-h-full lg:grid-cols-[minmax(0,1fr)_340px]'>
            <div className='min-w-0 px-5 py-6 sm:px-7 lg:pr-8'>
              <section aria-labelledby='quote-customer-heading'>
                <SectionHeading id='quote-customer-heading' title='Customer and service address' description='Connect this estimate to the customer and property where the work will happen.' />
                <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                  <Field label='Customer' htmlFor='new-quote-customer' required>
                    <div className='relative'>
                      <select
                        id='new-quote-customer'
                        value={quote.customerId}
                        onChange={(event) => {
                          setQuote((current) => ({ ...current, customerId: event.target.value, propertyId: '' }));
                          setSubmitError('');
                        }}
                        disabled={customersLoading}
                        className={`${fieldClass} appearance-none pr-9`}
                      >
                        <option value=''>{customersLoading ? 'Loading customers...' : 'Select a customer'}</option>
                        {customers.map((customer) => <option key={customer.id} value={customer.id}>{getCustomerName(customer)}</option>)}
                      </select>
                      <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7972]' />
                    </div>
                  </Field>
                  <Field label='Service address' htmlFor='new-quote-property' required>
                    <div className='relative'>
                      <select id='new-quote-property' value={quote.propertyId} onChange={(event) => updateQuoteField('propertyId', event.target.value)} disabled={!selectedCustomer} className={`${fieldClass} appearance-none pr-9`}>
                        <option value=''>{selectedCustomer ? 'Select a property' : 'Choose a customer first'}</option>
                        {selectedCustomer?.properties?.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}
                      </select>
                      <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7972]' />
                    </div>
                  </Field>
                </div>
                {selectedCustomer && (
                  <div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-[#e0e6e2] bg-[#f8faf9] px-3 py-3 text-sm text-[#536159]'>
                    <span className='inline-flex items-center gap-2 font-semibold text-[#24332c]'><Building2 className='h-4 w-4 text-[#456157]' />{getCustomerName(selectedCustomer)}</span>
                    {selectedCustomer.emails?.[0] && <a href={`mailto:${selectedCustomer.emails[0]}`} className='inline-flex items-center gap-1.5 hover:text-[#0d5944] hover:underline'><Mail className='h-3.5 w-3.5' />{selectedCustomer.emails[0]}</a>}
                    {selectedCustomer.customerPhones?.[0]?.phoneNumber && <a href={`tel:${selectedCustomer.customerPhones[0].phoneNumber}`} className='inline-flex items-center gap-1.5 hover:text-[#0d5944] hover:underline'><Phone className='h-3.5 w-3.5' />{selectedCustomer.customerPhones[0].phoneNumber}</a>}
                  </div>
                )}
              </section>

              <section aria-labelledby='quote-details-heading' className='mt-8 border-t border-[#dfe5e1] pt-7'>
                <SectionHeading id='quote-details-heading' title='Quote details' description='Name the work and choose who owns the follow-up.' />
                <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                  <Field label='Quote title' htmlFor='new-quote-title' required>
                    <input id='new-quote-title' value={quote.title} onChange={(event) => updateQuoteField('title', event.target.value)} placeholder='e.g. Boiler replacement' className={fieldClass} />
                  </Field>
                  <Field label='Lead source' htmlFor='new-quote-source' hint='Optional'>
                    <input id='new-quote-source' value={quote.source ?? ''} onChange={(event) => updateQuoteField('source', event.target.value)} placeholder='Referral, website, phone...' className={fieldClass} />
                  </Field>
                </div>

                <div className='mt-4 max-w-sm' ref={assigneeRef}>
                  <span className='mb-1.5 block text-sm font-semibold text-[#33423a]'>Assigned to</span>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => { setIsAssigneeOpen((open) => !open); void loadEmployees(); }}
                      aria-expanded={isAssigneeOpen}
                      className='flex h-10 w-full items-center justify-between rounded-md border border-[#cbd5d0] bg-white px-3 text-left text-sm text-[#24332c] hover:bg-[#f8faf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944]/30'
                    >
                      <span className='flex min-w-0 items-center gap-2'><UserRound className='h-4 w-4 shrink-0 text-[#456157]' /><span className='truncate'>{assigneeName || 'Unassigned'}</span></span>
                      <ChevronDown className='h-4 w-4 shrink-0 text-[#6b7972]' />
                    </button>
                    {isAssigneeOpen && (
                      <div className='absolute left-0 top-12 z-30 w-full min-w-[280px] overflow-hidden rounded-md border border-[#cbd5d0] bg-white shadow-[0_10px_28px_rgba(23,33,29,0.16)]'>
                        <label htmlFor='new-quote-assignee-search' className='relative block border-b border-[#e0e6e2] p-2'>
                          <span className='sr-only'>Search team members</span>
                          <Search className='pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]' />
                          <input id='new-quote-assignee-search' value={employeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder='Search team members' className='h-9 w-full rounded-md bg-[#f4f7f5] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5944]/25' />
                        </label>
                        <div className='max-h-56 overflow-y-auto py-1'>
                          <button type='button' onClick={() => { setQuote((current) => ({ ...current, assignedToUserId: '' })); setAssigneeName(''); setIsAssigneeOpen(false); }} className='flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#536159] hover:bg-[#f2f6f3]'>Unassigned</button>
                          {employeesLoading ? <div className='flex justify-center p-5'><LoaderCircle className='h-5 w-5 animate-spin text-[#0d5944]' /></div> : filteredEmployees.map((employee) => (
                            <button key={employee.id} type='button' onClick={() => { setQuote((current) => ({ ...current, assignedToUserId: employee.user.id })); setAssigneeName(employee.user.fullName); setIsAssigneeOpen(false); }} className='flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f2f6f3]'>
                              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6eeea] text-xs font-bold text-[#24533f]'>{getInitials(employee.user.fullName)}</span>
                              <span className='min-w-0'><span className='block truncate text-sm font-semibold text-[#24332c]'>{employee.user.fullName}</span><span className='block truncate text-xs text-[#718078]'>{employee.user.email}</span></span>
                            </button>
                          ))}
                          {!employeesLoading && filteredEmployees.length === 0 && <p className='px-3 py-5 text-center text-sm text-[#718078]'>No team members found.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section aria-labelledby='quote-line-items-heading' className='mt-8 border-t border-[#dfe5e1] pt-7'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                  <SectionHeading id='quote-line-items-heading' title='Line items' description='Search your pricebook or enter a custom service or material.' />
                  <div className='flex gap-2'>
                    <button type='button' onClick={() => addLineItem(false)} className='inline-flex h-9 items-center gap-1.5 rounded-md border border-[#cbd5d0] bg-white px-3 text-sm font-semibold text-[#34443c] hover:bg-[#f2f5f3]'><Plus className='h-4 w-4' /> Add item</button>
                    <button type='button' onClick={() => addLineItem(true)} className='inline-flex h-9 items-center gap-1.5 rounded-md border border-[#cbd5d0] bg-white px-3 text-sm font-semibold text-[#34443c] hover:bg-[#f2f5f3]'><Plus className='h-4 w-4' /> Optional</button>
                  </div>
                </div>

                <div className='mt-4 divide-y divide-[#dfe5e1] border-y border-[#dfe5e1]'>
                  {quote.lineItems.map((item, index) => (
                    <div key={`${item.serviceItemId ?? 'custom'}-${index}`} className='py-5'>
                      <div className='mb-3 flex items-center justify-between md:hidden'>
                        <span className='text-sm font-semibold text-[#33423a]'>Item {index + 1}</span>
                        <span className='font-semibold tabular-nums text-[#17211d]'>{formatCurrency(item.quantity * item.unitPrice)}</span>
                      </div>
                      <div className='grid gap-3 md:grid-cols-[minmax(220px,1fr)_90px_130px_120px_36px] md:items-start'>
                        <div className='min-w-0'>
                          <span id={`new-quote-item-${index}-label`} className='mb-1.5 block text-sm font-semibold text-[#33423a]'>Item or service</span>
                          <div className='relative'>
                            <input
                              id={`new-quote-item-${index}`}
                              aria-labelledby={`new-quote-item-${index}-label`}
                              value={item.name}
                              onFocus={() => { setActiveLineIndex(index); setServiceSearch(item.name); }}
                              onChange={(event) => { setActiveLineIndex(index); setServiceSearch(event.target.value); updateLineItem(index, 'name', event.target.value); }}
                              onBlur={() => window.setTimeout(() => setActiveLineIndex(null), 180)}
                              placeholder='Search pricebook or type a name'
                              className={fieldClass}
                            />
                            {activeLineIndex === index && serviceResults.length > 0 && (
                              <div className='absolute left-0 top-11 z-30 max-h-64 w-full min-w-[300px] overflow-y-auto rounded-md border border-[#cbd5d0] bg-white py-1 shadow-[0_10px_28px_rgba(23,33,29,0.16)]'>
                                {serviceResults.map((service) => (
                                  <button key={service.id} type='button' onMouseDown={(event) => event.preventDefault()} onClick={() => chooseServiceItem(index, service)} className='flex w-full items-start justify-between gap-4 px-3 py-2.5 text-left hover:bg-[#f2f6f3]'>
                                    <span className='min-w-0'><span className='block truncate text-sm font-semibold text-[#24332c]'>{service.name}</span><span className='mt-0.5 line-clamp-1 text-xs text-[#718078]'>{service.description || service.category}</span></span>
                                    <span className='shrink-0 text-sm font-semibold tabular-nums text-[#0d5944]'>{formatCurrency(service.unitPrice)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Field label='Quantity' htmlFor={`new-quote-quantity-${index}`}>
                          <input id={`new-quote-quantity-${index}`} type='number' min='0.001' step='0.001' value={item.quantity} onChange={(event) => updateLineItem(index, 'quantity', Number(event.target.value) || 0)} className={`${fieldClass} tabular-nums`} />
                        </Field>
                        <Field label='Unit price' htmlFor={`new-quote-price-${index}`}>
                          <div className='relative'><CircleDollarSign className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]' /><input id={`new-quote-price-${index}`} type='number' min='0' step='0.01' value={item.unitPrice} onChange={(event) => updateLineItem(index, 'unitPrice', Number(event.target.value) || 0)} className={`${fieldClass} pl-9 tabular-nums`} /></div>
                        </Field>
                        <div className='hidden pt-7 text-right md:block'><span className='font-semibold tabular-nums text-[#17211d]'>{formatCurrency(item.quantity * item.unitPrice)}</span></div>
                        <button type='button' onClick={() => removeLineItem(index)} disabled={quote.lineItems.length === 1} aria-label={`Remove line item ${index + 1}`} className='mt-7 hidden rounded-md p-2 text-[#718078] hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 md:inline-flex'><Trash2 className='h-4 w-4' /></button>
                      </div>
                      <div className='mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start'>
                        <Field label='Description' htmlFor={`new-quote-description-${index}`} hint='Optional'>
                          <textarea id={`new-quote-description-${index}`} rows={2} value={item.description ?? ''} onChange={(event) => updateLineItem(index, 'description', event.target.value)} placeholder='Scope, materials, exclusions, or other details' className={`${textareaClass} resize-y`} />
                        </Field>
                        <div className='flex flex-wrap items-center gap-4 pt-1 md:pt-7'>
                          <label htmlFor={`new-quote-taxable-${index}`} className='inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#536159]'><input id={`new-quote-taxable-${index}`} type='checkbox' checked={Boolean(item.isTaxable)} onChange={(event) => updateLineItem(index, 'isTaxable', event.target.checked)} className='h-4 w-4 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' />Taxable</label>
                          <label htmlFor={`new-quote-optional-${index}`} className='inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#536159]'><input id={`new-quote-optional-${index}`} type='checkbox' checked={item.isOptional} onChange={(event) => updateLineItem(index, 'isOptional', event.target.checked)} className='h-4 w-4 rounded border-[#aebbb4] text-[#0d5944] focus:ring-[#0d5944]' />Optional</label>
                          <button type='button' onClick={() => removeLineItem(index)} disabled={quote.lineItems.length === 1} className='inline-flex items-center gap-1.5 text-sm font-medium text-red-700 disabled:hidden md:hidden'><Trash2 className='h-4 w-4' /> Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby='quote-notes-heading' className='mt-8 border-t border-[#dfe5e1] pt-7'>
                <SectionHeading id='quote-notes-heading' title='Notes' description='Keep internal context separate from what the customer will see.' />
                <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                  <Field label='Internal note' htmlFor='new-quote-internal-note' hint='Team only'>
                    <textarea id='new-quote-internal-note' rows={4} value={quote.internalNotes[0]?.noteText ?? ''} onChange={(event) => updateNote('internalNotes', event.target.value)} placeholder='Site context, pricing rationale, or follow-up details' className={`${textareaClass} resize-y`} />
                  </Field>
                  <Field label='Customer note' htmlFor='new-quote-customer-note' hint='Appears on quote'>
                    <textarea id='new-quote-customer-note' rows={4} value={quote.customerNotes[0]?.noteText ?? ''} onChange={(event) => updateNote('customerNotes', event.target.value)} placeholder='Terms, preparation instructions, or a short message' className={`${textareaClass} resize-y`} />
                  </Field>
                </div>
              </section>
            </div>

            <aside aria-label='Quote summary' className='border-t border-[#d9e0dc] bg-[#f6f8f7] px-5 py-6 lg:border-l lg:border-t-0 lg:px-6'>
              <div className='lg:sticky lg:top-0'>
                <h3 className='text-base font-semibold text-[#17211d]'>Quote summary</h3>
                <p className='mt-1 text-sm text-[#65736c]'>This quote will be saved as a draft.</p>

                <dl className='mt-5 space-y-3 border-y border-[#d9e0dc] py-4 text-sm'>
                  <SummaryMeta icon={Building2} label='Customer' value={selectedCustomer ? getCustomerName(selectedCustomer) : 'Not selected'} />
                  <SummaryMeta icon={MapPin} label='Service address' value={selectedProperty?.address ?? 'Not selected'} />
                  <SummaryMeta icon={User} label='Assigned to' value={assigneeName || 'Unassigned'} />
                </dl>

                <div className='mt-5 space-y-4'>
                  <div className='flex items-center justify-between text-sm'><span className='text-[#65736c]'>Subtotal</span><strong className='font-semibold tabular-nums text-[#17211d]'>{formatCurrency(totals.subtotal)}</strong></div>
                  <div>
                    <div className='mb-1.5 flex items-center justify-between'><span id='new-quote-discount-label' className='text-sm font-medium text-[#536159]'>Discount</span><span className='text-xs tabular-nums text-[#718078]'>-{formatCurrency(totals.discountAmount)}</span></div>
                    <div className='flex overflow-hidden rounded-md border border-[#cbd5d0] bg-white'>
                      <button type='button' onClick={() => updateQuoteField('discountType', quote.discountType === DiscountType.Percentage ? DiscountType.FixedAmount : DiscountType.Percentage)} aria-label={`Use ${quote.discountType === DiscountType.Percentage ? 'fixed amount' : 'percentage'} discount`} className='flex h-10 w-10 shrink-0 items-center justify-center border-r border-[#d9e0dc] bg-[#f4f7f5] text-[#456157] hover:bg-[#e9efeb]'>{quote.discountType === DiscountType.Percentage ? <Percent className='h-4 w-4' /> : <CircleDollarSign className='h-4 w-4' />}</button>
                      <input id='new-quote-discount' aria-labelledby='new-quote-discount-label' type='number' min='0' step='0.01' value={quote.discountValue} onChange={(event) => updateQuoteField('discountValue', Number(event.target.value) || 0)} className='h-10 min-w-0 flex-1 px-3 text-sm tabular-nums outline-none' />
                    </div>
                  </div>
                  <div>
                    <div className='mb-1.5 flex items-center justify-between'><span id='new-quote-tax-label' className='text-sm font-medium text-[#536159]'>Tax rate</span><span className='text-xs tabular-nums text-[#718078]'>{formatCurrency(totals.taxAmount)}</span></div>
                    <div className='relative'><Percent className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]' /><input id='new-quote-tax' aria-labelledby='new-quote-tax-label' type='number' min='0' step='0.01' value={quote.taxRate} onChange={(event) => updateQuoteField('taxRate', Number(event.target.value) || 0)} className={`${fieldClass} pr-9 tabular-nums`} /></div>
                    <p className='mt-1.5 text-xs text-[#718078]'>Applied to taxable items after discount.</p>
                  </div>
                </div>

                <div className='mt-6 border-t-2 border-[#8fa198] pt-4'>
                  <div className='flex items-end justify-between gap-4'><span className='font-semibold text-[#24332c]'>Draft total</span><strong className='text-2xl font-semibold tabular-nums text-[#17211d]'>{formatCurrency(totals.total)}</strong></div>
                  {totals.taxableSubtotal > 0 && <p className='mt-1 text-right text-xs text-[#718078]'>{formatCurrency(totals.taxableSubtotal)} taxable</p>}
                </div>

                <div className='mt-6 flex items-start gap-2 rounded-md bg-[#e8f1ed] p-3 text-xs leading-5 text-[#28513f]'><Check className='mt-0.5 h-4 w-4 shrink-0' /><span>You can add attachments, revise details, and send the quote from its detail page.</span></div>
              </div>
            </aside>
          </div>
        </div>

        <footer className='shrink-0 border-t border-[#d9e0dc] bg-white px-5 py-3 sm:px-7'>
          {submitError && <div role='alert' className='mb-3 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800'><AlertCircle className='mt-0.5 h-4 w-4 shrink-0' /><span>{submitError}</span></div>}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs text-[#718078]'><span className='text-red-700'>*</span> Required fields</p>
            <div className='flex gap-2'>
              <button type='button' onClick={handleClose} disabled={isSubmitting} className='h-10 flex-1 rounded-md border border-[#cbd5d0] bg-white px-4 text-sm font-semibold text-[#34443c] hover:bg-[#f2f5f3] disabled:opacity-50 sm:flex-none'>Cancel</button>
              <button type='submit' disabled={isSubmitting} className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0d5944] px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,89,68,0.18)] hover:bg-[#084936] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5944] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'>{isSubmitting ? <LoaderCircle className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}{isSubmitting ? 'Creating...' : 'Create draft'}</button>
            </div>
          </div>
        </footer>
      </form>
    </Modal>
  );
};

const Field = ({ label, htmlFor, hint, required, children }: { label: string; htmlFor: string; hint?: string; required?: boolean; children: React.ReactNode }) => (
  <div className='min-w-0'>
    {/* The control is supplied through children, which this lint rule cannot resolve. */}
    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
    <label id={`${htmlFor}-label`} htmlFor={htmlFor} className='block text-sm font-semibold text-[#33423a]'>
      <span className='mb-1.5 flex items-center justify-between gap-3'>
        <span>{label}{required && <span className='ml-1 text-red-700'>*</span>}</span>
        {hint && <span className='text-xs font-normal text-[#718078]'>{hint}</span>}
      </span>
      <span className='block'>{children}</span>
    </label>
  </div>
);

const SectionHeading = ({ id, title, description }: { id: string; title: string; description: string }) => (
  <div>
    <h3 id={id} className='text-base font-semibold text-[#17211d]'>{title}</h3>
    <p className='mt-1 text-sm leading-6 text-[#65736c]'>{description}</p>
  </div>
);

const SummaryMeta = ({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) => (
  <div className='grid grid-cols-[18px_88px_minmax(0,1fr)] items-start gap-2'>
    <Icon className='mt-0.5 h-4 w-4 text-[#456157]' />
    <dt className='text-[#718078]'>{label}</dt>
    <dd className='truncate text-right font-medium text-[#33423a]' title={value}>{value}</dd>
  </div>
);

const calculateTotals = (quote: TAddQuote) => {
  const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const subtotal = round(quote.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const taxableBeforeDiscount = round(quote.lineItems.reduce((sum, item) => sum + (item.isTaxable ? item.quantity * item.unitPrice : 0), 0));
  const discountAmount = round(quote.discountType === DiscountType.Percentage ? subtotal * (quote.discountValue / 100) : quote.discountValue);
  const taxableDiscount = subtotal && taxableBeforeDiscount ? round(discountAmount * (taxableBeforeDiscount / subtotal)) : 0;
  const taxableSubtotal = round(taxableBeforeDiscount - taxableDiscount);
  const taxAmount = round(taxableSubtotal * (quote.taxRate / 100));
  return { subtotal, discountAmount, taxableSubtotal, taxAmount, total: round(subtotal - discountAmount + taxAmount) };
};

const getCustomerName = (customer: TCustomer) => customer.isCompany && customer.companyName
  ? customer.companyName
  : customer.fullName || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || 'Unnamed customer';

const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export default NewQuoteModal;
