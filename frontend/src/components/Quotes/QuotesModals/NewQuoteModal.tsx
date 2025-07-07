import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Plus,
  User,
  FileText,
  Calculator,
  Settings,
  Building2,
  Mail,
  Phone,
  Percent,
  DollarSign,
  Info,
  ChevronDown,
  MapPin, // Ensure ChevronDown is imported for the select input
} from 'lucide-react';
import { QuoteStatus } from '../../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import { TAddQuote, TQuote } from '../../../types/Quote';
import { GetCustomerByWorkspace } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import {
  GetServiceItems,
  GetServiceItemsByFilter,
} from '../../../services/ServiceItem';
import { TServiceItem } from '../../../types/ServiceItem';
import { CreateQuote } from '../../../services/Quote';
import { useAuth } from '../../../context/AuthProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { TAddLineItem } from '../../../types/LineItem';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';

interface INewQuoteModal {
  isOpen?: boolean;
  onClose: () => void;
  setQuotes: React.Dispatch<React.SetStateAction<TQuote[]>>;
}

// Main NewQuoteModal functional component
const NewQuoteModal = ({ isOpen, onClose, setQuotes }: INewQuoteModal) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [filteredServiceItems, setFilteredServiceItems] = useState<
    TServiceItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );

  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [quote, setQuote] = useState<TAddQuote>({
    workspaceId: '',
    customerId: '',
    createdByUserId: '',
    assignedToUserId: '',
    status: QuoteStatus.Draft,
    title: '',
    propertyId: '',
    lineItems: [
      {
        quantity: 1,
        name: '',
        unitPrice: 0,
        description: '',
      },
    ],
    discountType: DiscountType.Percentage,
    discountValue: 0,
    taxRate: 0,
    customerNotes: [
      {
        createdBy: '',
        createdByName: '',
        noteText: '',
      },
    ],
    internalNotes: [
      {
        createdBy: '',
        createdByName: '',
        noteText: '',
      },
    ],
    activityHistory: [],
    source: '',
    attachments: [],
  });

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      'status',
      'discountType',
      'taxRate',
      'discountValue',
    ];
    const parsedValue = numericFields.includes(name) ? Number(value) : value;

    setQuote((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const calculateQuoteTotals = (currentQuote: TAddQuote) => {
    const subtotal = currentQuote.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount =
      currentQuote.discountType === DiscountType.Percentage
        ? subtotal * (currentQuote.discountValue / 100)
        : currentQuote.discountValue;
    const taxAmount =
      (subtotal - discountAmount) * (currentQuote.taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } =
    calculateQuoteTotals(quote);

  const selectServiceItem = (
    currentQuote: TAddQuote,
    index: number,
    serviceItem: TServiceItem,
    setQuote: React.Dispatch<React.SetStateAction<TAddQuote>>,
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
    setActiveSearchIndex: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    setQuote((prev) => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        serviceItemId: serviceItem.id,
        name: serviceItem.name,
        description: serviceItem.description,
        unitPrice: serviceItem.unitPrice,
        isTaxable: serviceItem.isTaxable,
        taxRate: serviceItem.taxRate,
      };
      return { ...prev, lineItems: newLineItems };
    });
    setSearchTerm('');
    setActiveSearchIndex(null);
  };

  const handleLineItemChange = (
    currentQuote: TAddQuote,
    index: number,
    field: keyof TAddLineItem,
    value: any,
    setQuote: React.Dispatch<React.SetStateAction<TAddQuote>>
  ) => {
    setQuote((prev) => {
      const newLineItems = [...prev.lineItems];
      const updatedItem = { ...newLineItems[index] };

      if (
        (field === 'name' &&
          updatedItem.serviceItemId &&
          value !== updatedItem.name) ||
        (field === 'unitPrice' &&
          updatedItem.serviceItemId &&
          value !== updatedItem.unitPrice)
      ) {
        updatedItem.serviceItemId = undefined;
      }

      updatedItem[field] = value;
      newLineItems[index] = updatedItem;

      return { ...prev, lineItems: newLineItems };
    });
  };

  const addNewLineItem = (
    currentQuote: TAddQuote,
    setQuote: React.Dispatch<React.SetStateAction<TAddQuote>>
  ) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          quantity: 1,
          name: '',
          unitPrice: 0,
          description: '',
        },
      ],
    }));
  };

  const removeLineItem = (
    currentQuote: TAddQuote,
    index: number,
    setQuote: React.Dispatch<React.SetStateAction<TAddQuote>>
  ) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(e.target.value);
    setQuote((prev) => ({
      ...prev,
      customerId: e.target.value,
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPropertyId = e.target.value;
    setQuote((prev) => ({ ...prev, propertyId: selectedPropertyId }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.workspace) {
      console.error('User or workspace not available.');
      return;
    }
    const updatedQuote = {
      ...quote,
      workspaceId: user.workspace.id,
      createdByUserId: user.id,
      taxRate: quote.taxRate / 100,
      assignedToUserId: user.id,
      customerNotes: quote.customerNotes.filter(
        (n) => n.noteText?.trim() && n.createdBy && n.createdByName
      ),
      internalNotes: quote.internalNotes.filter(
        (n) => n.noteText?.trim() && n.createdBy && n.createdByName
      ),
    };
    try {
      const response = await CreateQuote(updatedQuote);
      if (response.status === 200) {
        console.log(response);

        setQuotes((prev) => [response.data, ...prev]);
        onClose();
      } else {
        console.error(
          'Failed to create quote:',
          response.data?.message ?? 'Unknown error'
        );
      }
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  const fetchCustomers = async () => {
    if (!user?.workspace) return;
    try {
      const response = await GetCustomerByWorkspace(user.workspace.id, 1, 10);
      if (response.status === 200) {
        setCustomers(response.data.payload.items);
      } else {
        console.error(
          'Failed to fetch customers:',
          response.data?.message ?? 'Unknown error'
        );
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAllServiceItems = async () => {
    try {
      const response = await GetServiceItems();
      if (response.status === 200) {
        setServiceItems(response.data.payload);
      } else {
        console.error(
          'Failed to fetch service items:',
          response.data?.message ?? 'Unknown error'
        );
      }
    } catch (error) {
      console.error('Error fetching service items:', error);
    }
  };

  const searchServiceItems = async (term: string): Promise<TServiceItem[]> => {
    if (!term || !user?.workspace) return [];
    try {
      const response = await GetServiceItemsByFilter(
        user.workspace.id,
        1,
        10,
        `q=${encodeURIComponent(term)}`
      );
      if (response.status === 200) {
        return response.data.payload.slice(0, 5);
      }
      console.error(
        'Failed to search service items:',
        response.data?.message ?? 'Unknown error'
      );
      return [];
    } catch (error) {
      console.error('Error searching service items:', error);
      return [];
    }
  };

  const handleAddNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    const updatedNote = {
      createdBy: user.id || '',
      createdByName: user?.fullName ?? '',
      noteText: value,
      customerId: selectedCustomerData?.id ?? '',
    };
    setQuote((prev) => ({
      ...prev,
      [name]: [updatedNote],
    }));
  };

  useEffect(() => {
    fetchCustomers();
    fetchAllServiceItems();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm && activeSearchIndex !== null) {
      searchServiceItems(debouncedSearchTerm).then((items) => {
        setFilteredServiceItems(items);
      });
    } else {
      setFilteredServiceItems([]);
    }
  }, [debouncedSearchTerm, activeSearchIndex, user?.workspace?.id]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header - Sticky */}
        <div className='sticky top-0 bg-white z-10 flex justify-between items-center px-8 py-5 border-b border-gray-100 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Create New Quote
            </h2>
            <p className='text-gray-500 text-sm mt-1'>
              Fill in all required fields to create a new quote.
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
            aria-label='Close modal'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className='flex-1 overflow-hidden flex flex-col lg:flex-row'>
          {/* Left Column: Quote Details (Customer, Line Items) - Scrollable */}
          <div className='flex-1 overflow-y-auto px-8 py-6 lg:w-3/5 border-r border-gray-100'>
            {/* The form tag needs an ID to be referenced by the submit button in the footer */}
            <form id='quote-form' onSubmit={handleSubmit} className='space-y-8'>
              {/* Customer Section */}
              <div className='bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm'>
                <div className='flex items-center space-x-3 mb-5'>
                  <User className='w-5 h-5 text-[#356852]' />
                  <h3 className='font-semibold text-lg text-gray-900'>
                    Customer Information
                  </h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div>
                      <label
                        htmlFor='customer-select'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Choose customer <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <select
                          id='customer-select'
                          value={selectedCustomer}
                          onChange={handleCustomerChange}
                          required
                          className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                        >
                          <option value=''>Select a customer...</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </option>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />{' '}
                          {/* Using ChevronDown for dropdown arrow */}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor='customer-select'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Choose customer property{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <select
                          id='customer-select'
                          value={quote.propertyId}
                          onChange={handlePropertyChange}
                          required
                          className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                        >
                          <option value=''>Select a customer...</option>
                          {selectedCustomerData?.properties?.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.address}
                            </option>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />{' '}
                          {/* Using ChevronDown for dropdown arrow */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCustomerData ? (
                    <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                      <div className='flex items-start space-x-3'>
                        <div className='w-9 h-9 bg-[#e6f4ed] rounded-full flex items-center justify-center flex-shrink-0'>
                          <Building2 className='w-5 h-5 text-[#356852]' />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 text-base'>
                            {selectedCustomerData.fullName}
                          </h4>
                          <div className='mt-2 space-y-1 text-sm text-gray-600'>
                            {selectedCustomerData.emails?.[0] && (
                              <div className='flex items-center'>
                                <Mail className='w-4 h-4 mr-2 text-gray-500' />
                                <a
                                  href={`mailto:${selectedCustomerData.emails[0]}`}
                                  className='hover:underline'
                                >
                                  {selectedCustomerData.emails[0]}
                                </a>
                              </div>
                            )}
                            {selectedCustomerData.customerPhones?.[0]
                              ?.phoneNumber && (
                              <div className='flex items-center'>
                                <Phone className='w-4 h-4 mr-2 text-gray-500' />
                                <a
                                  href={`tel:${selectedCustomerData.customerPhones[0].phoneNumber}`}
                                  className='hover:underline'
                                >
                                  {
                                    selectedCustomerData.customerPhones[0]
                                      .phoneNumber
                                  }
                                </a>
                              </div>
                            )}
                            {quote.propertyId != '' && (
                              <div className='flex items-center'>
                                <MapPin className='w-4 h-4 mr-2 text-gray-500' />
                                <p>
                                  {
                                    selectedCustomerData.properties.find(
                                      (p) => p.id === quote.propertyId
                                    )?.address
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 text-sm italic'>
                      <Info className='w-5 h-5 mr-2 text-gray-400' />
                      No customer selected.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p>Title</p>
                <input
                  type='text'
                  placeholder='title'
                  onChange={(e) =>
                    setQuote({ ...quote, title: e.target.value })
                  }
                  className='border border-gray-300 rounded-lg w-full p-2.5 text-sm'
                />
              </div>

              {/* Line Items Section */}
              <div className='space-y-6'>
                <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                  <div className='flex items-center space-x-3'>
                    <FileText className='w-5 h-5 text-[#356852]' />
                    <h3 className='font-semibold text-lg text-gray-900'>
                      Line Items
                    </h3>
                  </div>
                  <button
                    type='button'
                    onClick={() => addNewLineItem(quote, setQuote)}
                    className='flex items-center px-4 py-2 bg-[#356852] text-white rounded-lg hover:bg-[#2d5a44] transition-colors font-medium text-sm shadow-md'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Item
                  </button>
                </div>

                {/* Header Row for Line Items */}
                <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase pb-2 border-b border-gray-200'>
                  <div className='col-span-6'>Service</div>
                  <div className='col-span-2'>Qty</div>
                  <div className='col-span-2 '>Unit Price</div>
                  <div className='col-span-2 text-right'>Total</div>
                </div>

                <div className='space-y-6'>
                  {quote.lineItems.map((item, index) => (
                    <div
                      key={item.serviceItemId ?? `new-item-${index}`} // Unique key for new items
                      className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm'
                    >
                      {/* Line 1: Service Name, Qty, Unit Price, Total */}
                      <div className='grid grid-cols-12 gap-4 items-center'>
                        <div className='col-span-6 relative'>
                          <input
                            type='text'
                            value={item.name ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchTerm(value);
                              handleLineItemChange(
                                quote,
                                index,
                                'name',
                                value,
                                setQuote
                              );
                            }}
                            onFocus={() => setActiveSearchIndex(index)}
                            // Use onBlur with a timeout to allow click on search results
                            onBlur={() =>
                              setTimeout(() => setActiveSearchIndex(null), 200)
                            }
                            className='w-full p-2.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-0.5 focus:ring-[#356852] focus:border-[#356852] outline-none'
                            placeholder='Service name'
                            ref={(el) => (searchInputRefs.current[index] = el)}
                          />

                          {/* Search Results Dropdown */}
                          {activeSearchIndex === index &&
                            filteredServiceItems.length > 0 && (
                              <div className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                {filteredServiceItems.map((service) => (
                                  <div
                                    key={service.id}
                                    className='px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer flex justify-between items-center'
                                    // Use onMouseDown to prevent input blur before onClick fires
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() =>
                                      selectServiceItem(
                                        quote,
                                        index,
                                        service,
                                        setQuote,
                                        setSearchTerm,
                                        setActiveSearchIndex
                                      )
                                    }
                                  >
                                    <span>{service.name}</span>
                                    <span className='font-medium text-[#356852]'>
                                      {formatCurrency(service.unitPrice)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className='col-span-2'>
                          <input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              handleLineItemChange(
                                quote,
                                index,
                                'quantity',
                                parseInt(e.target.value) || 1,
                                setQuote
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-0.5 focus:ring-[#356852] focus:border-[#356852] outline-none'
                          />
                        </div>

                        <div className='col-span-2'>
                          <input
                            type='number'
                            step='0.01'
                            min='0'
                            value={item.unitPrice ?? 0.0}
                            onChange={(e) =>
                              handleLineItemChange(
                                quote,
                                index,
                                'unitPrice',
                                parseFloat(e.target.value) || 0,
                                setQuote
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-0.5 focus:ring-[#356852] focus:border-[#356852] outline-none'
                          />
                        </div>

                        <div className='col-span-2 text-right text-base font-semibold text-gray-900'>
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>

                      {/* Line 2: Description */}
                      <div className='mt-3 grid grid-cols-12 gap-3 items-start'>
                        <div className='col-span-6'>
                          <textarea
                            rows={2}
                            value={item.description ?? ''}
                            onChange={(e) =>
                              handleLineItemChange(
                                quote,
                                index,
                                'description',
                                e.target.value,
                                setQuote
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-0.5 focus:ring-[#356852] focus:border-[#356852] resize-y outline-none'
                            placeholder='Add a description for this service item (optional)'
                          />
                        </div>

                        <div className='col-span-2'>
                          {quote.lineItems.length > 1 && (
                            <ButtonIcon
                              name='Remove'
                              customTextStyle='text-red-500'
                              handleBtnClick={() =>
                                removeLineItem(quote, index, setQuote)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className='mt-10 space-y-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                <div className='flex items-center space-x-3'>
                  <Calculator className='w-5 h-5 text-[#356852]' />
                  <h3 className='font-semibold text-lg text-gray-900'>
                    Pricing Summary
                  </h3>
                </div>

                <div className='space-y-4'>
                  {/* Discount */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Discount
                    </label>
                    <div className='flex items-center space-x-3'>
                      <button
                        type='button'
                        onClick={() =>
                          setQuote((prev) => ({
                            ...prev,
                            discountType:
                              prev.discountType === DiscountType.Percentage
                                ? DiscountType.FixedAmount
                                : DiscountType.Percentage,
                          }))
                        }
                        className='w-11 h-11 flex items-center justify-center border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-100 transition-colors text-gray-600'
                      >
                        {quote.discountType === DiscountType.Percentage ? (
                          <Percent className='w-5 h-5' />
                        ) : (
                          <DollarSign className='w-5 h-5' />
                        )}
                      </button>
                      <input
                        type='number'
                        name='discountValue'
                        value={quote.discountValue}
                        onChange={handleChange}
                        min='0'
                        step={
                          quote.discountType === DiscountType.Percentage
                            ? '0.01'
                            : '1'
                        }
                        className='flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-base'
                        placeholder='0.00'
                      />
                    </div>
                    {discountAmount > 0 && (
                      <div className='flex justify-between text-sm text-[#2d5a44] font-medium'>
                        <span>Discount Applied</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tax */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Tax Rate (%)
                    </label>
                    <input
                      type='number'
                      name='taxRate'
                      value={quote.taxRate}
                      onChange={handleChange}
                      min='0'
                      step='0.01'
                      className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-base'
                      placeholder='0.00'
                    />
                    <div className='flex justify-between text-sm text-gray-600'>
                      <span>Tax Amount</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  </div>

                  {/* Receipt-style Summary */}
                  <div className='pt-5 border-t border-gray-200 mt-6 space-y-2 text-base'>
                    <div className='flex justify-between'>
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Tax</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className='flex justify-between text-xl font-bold pt-3 border-t border-gray-200'>
                      <span>Total</span>
                      <span className='text-[#356852]'>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className='mt-10 space-y-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                <div className='flex items-center space-x-3'>
                  <Settings className='w-5 h-5 text-[#356852]' />
                  <h3 className='font-semibold text-lg text-gray-900'>Notes</h3>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label
                      htmlFor='customer-notes'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Customer Notes
                    </label>
                    <textarea
                      id='customer-notes'
                      name='customerNotes'
                      value={quote.customerNotes?.[0]?.noteText || ''}
                      onChange={handleAddNote}
                      rows={4}
                      className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm resize-y'
                      placeholder='Notes visible to customer on the quote...'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='internal-notes'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Internal Notes
                    </label>
                    <textarea
                      id='internal-notes'
                      name='internalNotes'
                      value={quote.internalNotes?.[0]?.noteText || ''}
                      onChange={handleAddNote}
                      rows={4}
                      className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm resize-y'
                      placeholder='Internal notes (not visible to customer)...'
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className='sticky bottom-0 bg-white z-10 px-8 py-4 border-t border-gray-100 shadow-inner'>
          <div className='flex items-center justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-base shadow-sm'
            >
              Cancel
            </button>
            <button
              type='submit'
              form='quote-form' // Associate with the form by ID
              className='px-6 py-2.5 bg-[#356852] text-white rounded-lg hover:bg-[#2d5a44] transition-colors font-medium text-base shadow-md'
            >
              Create Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuoteModal;
