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
  MapPin,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  User2,
  Trash2, // Ensure ChevronDown is imported for the select input
} from 'lucide-react';
import { QuoteStatus } from '../../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import { TAddQuote, TQuote } from '../../../types/Quote';
import { GetCustomerByWorkspace } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import {
  GetServiceItems,
  GetServiceItemsByFilter,
  GetServiceItemsByWorkspace,
} from '../../../services/ServiceItem';
import { TServiceItem } from '../../../types/ServiceItem';
import { CreateQuote } from '../../../services/Quote';
import { useAuth } from '../../../context/AuthProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { TAddLineItem } from '../../../types/LineItem';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import IconButton from '../../CustomElements/Buttons/IconButton';
import {
  GetEmployeeById,
  GetEmployeesByWorkspace,
} from '../../../services/Employee';
import { TEmployee } from '../../../types/Employee';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface INewQuoteModal {
  isOpen?: boolean;
  onClose: () => void;
  setQuotes: React.Dispatch<React.SetStateAction<TQuote[]>>;
}

// Main NewQuoteModal functional component
const NewQuoteModal = ({ isOpen, onClose, setQuotes }: INewQuoteModal) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  // const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [filteredServiceItems, setFilteredServiceItems] = useState<
    TServiceItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [isAssignUserOpen, setIsAssignUserOpen] = useState<boolean>(false);
  const [assignedUserName, setAssignedUserName] = useState(user?.fullName);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, 300);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<TEmployee[]>([]);
  const [isAssignedUserLoading, setIsAssignedUserLoading] =
    useState<boolean>(false);
  const assignUserRef = useClickOutside<HTMLDivElement>(() =>
    setIsAssignUserOpen(false)
  );
  const [isAddDiscount, setIsAddDiscount] = useState<boolean>(false);
  const [isAddTax, setIsAddTax] = useState<boolean>(false);

  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [quote, setQuote] = useState<TAddQuote>({
    workspaceId: '',
    customerId: '',
    createdByUserId: '',
    assignedToUserId: user?.id || '',
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

  const handleCreateQuote = async () => {
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

  const fetchEmployees = async () => {
    if (!user?.workspace) return;
    setIsAssignedUserLoading(true);
    const response = await GetEmployeesByWorkspace(user.workspace.id);

    if (response.status === 200) {
      setEmployees(response.data.payload);
      setFilteredEmployees(response.data.payload);
    }
    setIsAssignedUserLoading(false);
  };

  // const fetchAllServiceItems = async () => {
  //   if (!user?.workspace) return;
  //   try {
  //     const response = await GetServiceItemsByWorkspace(
  //       user.workspace.id,
  //       1,
  //       10
  //     );
  //     if (response.status === 200) {
  //       setServiceItems(response.data.payload.items);
  //     } else {
  //       console.error(
  //         'Failed to fetch service items:',
  //         response.data?.message ?? 'Unknown error'
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error fetching service items:', error);
  //   }
  // };

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
        return response.data.payload.items.slice(0, 5);
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
    // fetchAllServiceItems();
  }, []);

  useEffect(() => {
    if (debouncedUserSearchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (e) =>
          e.user.fullName
            .toLowerCase()
            .includes(debouncedUserSearchTerm.toLowerCase()) ||
          e.user.email.includes(debouncedUserSearchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [debouncedUserSearchTerm, employees]);

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
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header - Sticky */}
        <div className='sticky top-0 bg-white z-10 flex justify-between items-center px-8 py-5 border-b border-gray-100 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-text-primary'>
              Create Quote
            </h2>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 cursor-pointer rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
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
            <div className='space-y-8'>
              {/* Customer Section */}
              <div className='bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm'>
                <div className='mb-5'>
                  <h3 className='font-semibold text-xl text-text-primary'>
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
                      <div className='relative bg-white'>
                        <select
                          id='customer-select'
                          value={selectedCustomer}
                          onChange={handleCustomerChange}
                          required
                          className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm appearance-none'
                        >
                          <option value=''>Select a customer...</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </option>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor='customer-select'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Choose property <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative bg-white'>
                        <select
                          id='customer-select'
                          value={quote.propertyId}
                          onChange={handlePropertyChange}
                          required
                          className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm appearance-none'
                        >
                          <option value=''>Select a property...</option>
                          {selectedCustomerData?.properties?.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.address}
                            </option>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />
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
              <div className='space-y-6'>
                <h3 className='font-semibold text-xl text-text-primary'>
                  Quote Details
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-6'>
                    <div className='flex-1'>
                      <label
                        htmlFor='title'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Quote Title <span className='text-red-500'>*</span>
                      </label>
                      <input
                        id='title'
                        type='text'
                        name='title'
                        placeholder='Title'
                        value={quote.title}
                        onChange={handleChange}
                        className='border border-gray-300 rounded-lg w-full p-2.5 text-sm focus:ring-2 focus:ring-bg-primary focus:border-transparent focus:outline-none'
                      />
                    </div>
                    <div className='flex-1'>
                      <label
                        htmlFor='source'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Source
                      </label>
                      <input
                        id='source'
                        type='text'
                        name='source'
                        placeholder='Source'
                        value={quote.source}
                        onChange={handleChange}
                        className='border border-gray-300 rounded-lg w-full p-2.5 text-sm focus:ring-2 focus:ring-bg-primary focus:border-transparent focus:outline-none'
                      />
                    </div>
                  </div>
                  <div className='w-full flex'>
                    <div>
                      <p className='block text-sm font-medium text-gray-700 mb-2'>
                        Assigned To
                      </p>
                      {quote.assignedToUserId ? (
                        <div className='w-full p-1 flex items-center space-x-2 rounded-full bg-gray-200'>
                          <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center'>
                            <User className='w-5 h-5' />
                          </div>
                          <p className='text-sm text-text-primary'>
                            {assignedUserName}
                          </p>
                          <button
                            onClick={() => {
                              setQuote((prev) => ({
                                ...prev,
                                assignedToUserId: '',
                              }));
                              setAssignedUserName('');
                            }}
                            className='cursor-pointer pr-1.5 hover:text-red-500'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                      ) : (
                        <div ref={assignUserRef} className='relative'>
                          <IconButton
                            onClick={() => {
                              fetchEmployees();
                              setIsAssignUserOpen(!isAssignUserOpen);
                            }}
                            icon={
                              <Plus className='w-4 h-4 text-bg-primary mr-1' />
                            }
                            customStyle='!rounded-full py-1.5 px-4 !text-bg-primary hover:border-gray-300'
                          >
                            Assign user
                          </IconButton>
                          {isAssignUserOpen && (
                            <div className='absolute min-w-[350px] left-0 mt-2 z-50 py-2 flex flex-col justify-center shadow-xl bg-white border border-gray-200 rounded-lg space-y-2'>
                              <div className='px-2'>
                                <input
                                  type='text'
                                  placeholder='Search...'
                                  value={userSearchTerm}
                                  onChange={(e) =>
                                    setUserSearchTerm(e.target.value)
                                  }
                                  className='outline-none border-b border-gray-200 w-full px-2 pb-2 text-sm'
                                />
                              </div>
                              <div>
                                {isAssignedUserLoading ? (
                                  <div className='flex justify-center p-6'>
                                    <div className='w-5 h-5 border-2 border-gray-300 border-t-bg-primary rounded-full animate-spin'></div>
                                  </div>
                                ) : filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      onClick={() => {
                                        setQuote((prev) => ({
                                          ...prev,
                                          assignedToUserId: employee.user.id,
                                        }));
                                        setAssignedUserName(
                                          employee.user.fullName
                                        );
                                        setIsAssignUserOpen(false);
                                      }}
                                      className='px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer'
                                    >
                                      <div className='rounded-full overflow-hidden bg-gray-400 w-9 h-9 flex items-center justify-center'>
                                        <User2 className='w-4 h-4' />
                                      </div>
                                      <div>
                                        <p className='text-text-primary font-semibold text-sm'>
                                          {employee.user.fullName}
                                        </p>
                                        <p className='text-gray-500 text-sm'>
                                          {employee.user.email}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className='flex flex-col items-center justify-center p-6 text-gray-500'>
                                    <User2 className='w-8 h-8 mb-2' />
                                    <p className='text-sm font-medium'>
                                      No users found
                                    </p>
                                    <p className='text-xs text-gray-400'>
                                      Try adjusting your search term.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Line Items
                  </h3>
                </div>

                {/* Header Row for Line Items */}
                <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase pb-2 border-b border-gray-200'>
                  <div className='col-span-6'>Item name</div>
                  <div className='col-span-2'>Qty</div>
                  <div className='col-span-2 '>Unit Price</div>
                  <div className='col-span-2 text-right'>Total</div>
                </div>

                <div className='space-y-6'>
                  {quote.lineItems.map((item, index) => (
                    <div
                      key={item.serviceItemId ?? `new-item-${index}`}
                      className=''
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
                              <div className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-200'>
                                {filteredServiceItems.map((service) => (
                                  <div
                                    key={service.id}
                                    className='px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer flex justify-between items-start space-x-5'
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
                                    <div className='flex flex-col space-y-1'>
                                      <span className='text-text-primary font-semibold'>
                                        {service.name}
                                      </span>
                                      <span className='text-gray-500'>
                                        {service.description}
                                      </span>
                                    </div>
                                    <span className='font-semibold text-bg-primary'>
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
                            rows={3}
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
                <div className='flex items-center space-x-3'>
                  <IconButton
                    icon={<Plus className='w-4 h-4 mr-2' />}
                    onClick={() => addNewLineItem(quote, setQuote)}
                    customStyle='py-2 px-4 text-white bg-bg-primary'
                  >
                    Add Line Item
                  </IconButton>
                  <IconButton
                    icon={<CheckSquare className='w-4 h-4 mr-2' />}
                    onClick={() => addNewLineItem(quote, setQuote)}
                    customStyle='py-2 px-4 text-text-primary'
                  >
                    Add Optional Line Item
                  </IconButton>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className='mt-10 space-y-6 w-full flex flex-col items-end justify-end'>
                <div className='w-1/2 space-y-4'>
                  <div className='pt-5 mt-6 space-y-3 text-base'>
                    <div className='flex justify-between pr-6'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='text-gray-900 font-medium'>
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600'>Discount</span>
                      {isAddDiscount && (
                        <div className='max-w-[220px] flex items-center border border-gray-200 rounded-lg overflow-hidden'>
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
                            className='w-9 h-9 flex items-center cursor-pointer bg-gray-50 border-r border-gray-200 justify-center hover:bg-gray-100 transition-colors text-gray-600'
                          >
                            {quote.discountType === DiscountType.Percentage ? (
                              <Percent className='w-4 h-4' />
                            ) : (
                              <DollarSign className='w-4 h-4' />
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
                            className='px-2 py-1.5 w-full text-gray-900 outline-none text-base'
                            placeholder='0.00'
                          />
                        </div>
                      )}
                      {discountAmount == 0 && !isAddDiscount ? (
                        <div className='pr-6'>
                          <button
                            onClick={() => setIsAddDiscount(true)}
                            className='text-bg-primary font-medium cursor-pointer hover:text-bg-primary-hover'
                          >
                            Add discount
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center space-x-1.5'>
                          <span className='text-gray-900 font-medium'>
                            -{formatCurrency(discountAmount)}
                          </span>
                          <button
                            onClick={() => {
                              setIsAddDiscount(false);
                              setQuote((prev) => ({
                                ...prev,
                                discountValue: 0,
                              }));
                            }}
                            className='cursor-pointer'
                          >
                            <Trash2 className='w-4.5 h-4.5 text-red-600' />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600'>Tax</span>
                      {isAddTax && (
                        <div className='max-w-[220px] flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                          <button className='w-9 h-9 flex items-center border-r border-gray-200 justify-center text-gray-600'>
                            <Percent className='w-4 h-4' />
                          </button>
                          <input
                            type='number'
                            name='taxRate'
                            value={quote.taxRate}
                            onChange={handleChange}
                            min='0'
                            step='0.01'
                            className='px-2 py-1.5 w-full text-gray-900 outline-none text-base'
                            placeholder='0.00'
                          />
                        </div>
                      )}
                      {taxAmount == 0 && !isAddTax ? (
                        <div className='pr-6'>
                          <button
                            onClick={() => setIsAddTax(true)}
                            className='text-bg-primary font-medium cursor-pointer hover:text-bg-primary-hover'
                          >
                            Add tax
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center space-x-1.5'>
                          <span className='text-gray-900 font-medium'>
                            {formatCurrency(taxAmount)}
                          </span>
                          <button
                            onClick={() => {
                              setIsAddTax(false);
                              setQuote((prev) => ({
                                ...prev,
                                taxRate: 0,
                              }));
                            }}
                            className='cursor-pointer'
                          >
                            <Trash2 className='w-4.5 h-4.5 text-red-600' />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className='pr-6 flex justify-between text-xl font-bold pt-3 text-text-primary border-t border-gray-200'>
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className='mt-10 space-y-6'>
                <h3 className='font-semibold text-xl text-text-primary'>
                  Notes
                </h3>

                <div className='space-y-4'>
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
                      value={quote.internalNotes?.[0]?.noteText}
                      onChange={handleAddNote}
                      rows={4}
                      className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm resize-y'
                      placeholder='Internal notes (not visible to customer)...'
                    />
                  </div>
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
                      value={quote.customerNotes?.[0]?.noteText}
                      onChange={handleAddNote}
                      rows={4}
                      className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm resize-y'
                      placeholder='Notes visible to customer on the quote...'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-white z-10 px-8 py-4 border-t border-gray-100'>
          <div className='flex items-center justify-end space-x-3'>
            <CustomButton
              onClick={onClose}
              customStyle='px-5 py-2.5 shadow-sm border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleCreateQuote}
              customStyle='px-5 py-2.5 bg-bg-primary text-white hover:bg-bg-primary-hover'
            >
              Create Quote
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuoteModal;
