import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Plus,
  Building2,
  Mail,
  Phone,
  ChevronDown,
  MapPin,
  Percent,
  DollarSign,
  Trash2,
  Info,
} from 'lucide-react';
import { GetCustomerByWorkspace } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import { TServiceItem } from '../../../types/ServiceItem';
import { GetServiceItemsByFilter } from '../../../services/ServiceItem';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import IconButton from '../../CustomElements/Buttons/IconButton';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { TAddInvoice } from '../../../types/Invoice';
import { TAddLineItem } from '../../../types/LineItem';
import { CreateInvoice } from '../../../services/Invoice';
import { useAuth } from '../../../context/AuthProvider';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import { InvoiceStatus } from '../../../constants/Enumeration/InvoiceEnum/InvoiceEnum';
import { useDebounce } from '../../../hooks/useDebounce';

interface ICreateInvoiceModal {
  isOpen: boolean;
  onClose: () => void;
}

const CreateInvoiceModal = ({ isOpen, onClose }: ICreateInvoiceModal) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [filteredServiceItems, setFilteredServiceItems] = useState<
    TServiceItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [isAddDiscount, setIsAddDiscount] = useState<boolean>(false);
  const [isAddTax, setIsAddTax] = useState<boolean>(false);

  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [invoice, setInvoice] = useState<TAddInvoice>({
    customerId: '',
    workspaceId: '',
    propertyId: '',
    title: '',
    lineItems: [
      {
        quantity: 1,
        name: '',
        unitPrice: 0,
        description: '',
        isOptional: false,
      },
    ],
    taxRate: 0,
    discount: 0,
    discountType: DiscountType.Percentage,
    dueDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    paymentTerms: 'uponReceipt',
    notes: '',
    internalNotes: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const customerProperties = selectedCustomerData?.properties.filter(
    (p) => p.customerId === selectedCustomer
  );
  const selectedPropertyData = selectedCustomerData?.properties.find(
    (p) => p.id === selectedProperty
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let parsedValue: any = value;

    if (name === 'taxRate' || name === 'discount' || name === 'discountValue') {
      parsedValue = Number(value);
    }

    setInvoice((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const calculateInvoiceTotals = (currentInvoice: TAddInvoice) => {
    const subtotal = currentInvoice.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount =
      currentInvoice.discountType === DiscountType.Percentage
        ? subtotal * (currentInvoice.discount / 100)
        : currentInvoice.discount;
    const taxAmount = (subtotal - discountAmount) * currentInvoice.taxRate;
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } =
    calculateInvoiceTotals(invoice);

  const selectServiceItem = (
    currentInvoice: TAddInvoice,
    index: number,
    serviceItem: TServiceItem,
    setInvoice: React.Dispatch<React.SetStateAction<TAddInvoice>>,
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
    setActiveSearchIndex: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    setInvoice((prev) => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        serviceItemId: serviceItem.id,
        name: serviceItem.name,
        description: serviceItem.description,
        unitPrice: serviceItem.unitPrice,
        isTaxable: serviceItem.isTaxable,
      };
      return { ...prev, lineItems: newLineItems };
    });
    setSearchTerm('');
    setActiveSearchIndex(null);
  };

  const handleLineItemChange = (
    currentInvoice: TAddInvoice,
    index: number,
    field: keyof TAddLineItem,
    value: any,
    setInvoice: React.Dispatch<React.SetStateAction<TAddInvoice>>
  ) => {
    setInvoice((prev) => {
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
    currentInvoice: TAddInvoice,
    setInvoice: React.Dispatch<React.SetStateAction<TAddInvoice>>
  ) => {
    setInvoice((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          quantity: 1,
          name: '',
          unitPrice: 0,
          description: '',
          isOptional: false,
        },
      ],
    }));
  };

  const removeLineItem = (
    currentInvoice: TAddInvoice,
    index: number,
    setInvoice: React.Dispatch<React.SetStateAction<TAddInvoice>>
  ) => {
    if (currentInvoice.lineItems.length > 1) {
      setInvoice((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setSelectedProperty(''); // Reset property selection
    setInvoice((prev) => ({
      ...prev,
      customerId: customerId,
      // No propertyId in TAddInvoice, will be handled by separate state
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
    // You might want to store propertyId in invoice if your backend supports it
    // For now, it's just for display
  };

  const handleCreateInvoice = async () => {
    if (!user?.workspace) {
      console.error('User or workspace not available.');
      return;
    }

    const finalInvoice = {
      ...invoice,
      workspaceId: user.workspace.id,
      propertyId: selectedProperty,
      notes: invoice.notes,
      internalNotes: invoice.internalNotes,
      // If propertyId needs to be sent, add it here based on selectedProperty state
      // propertyId: selectedProperty,
    };

    if (invoice.dueDate) {
      finalInvoice.dueDate = invoice.dueDate;
    } else {
      // If dueDate is empty, ensure it's not sent or set to undefined
      delete finalInvoice.dueDate;
    }

    try {
      const response = await CreateInvoice(finalInvoice);
      if (response.status === 200) {
        onClose();
        // Reset form after successful creation
        setInvoice({
          customerId: '',
          workspaceId: '',
          propertyId: '',
          title: '',
          lineItems: [
            {
              quantity: 1,
              name: '',
              unitPrice: 0,
              description: '',
              isOptional: false,
            },
          ],
          taxRate: 0,
          discount: 0,
          discountType: DiscountType.Percentage,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          paymentTerms: 'uponReceipt',
          notes: '',
          internalNotes: '',
        });
        setSelectedCustomer('');
        setSelectedProperty('');
      } else {
        console.error(
          'Failed to create invoice:',
          response.data?.message ?? 'Unknown error'
        );
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const fetchCustomers = async () => {
    if (!user || !user.workspace) return;
    try {
      const response = await GetCustomerByWorkspace(user.workspace.id, 1, 1000);
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

  useEffect(() => {
    fetchCustomers();
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
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header - Sticky */}
        <div className='sticky top-0 bg-white z-10 flex justify-between items-center px-8 py-5 border-b border-gray-100 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-text-primary'>
              Create Invoice
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
        <div className='flex-1 overflow-y-auto px-8 py-6'>
          <div className='space-y-8'>
            {/* Customer Section */}
            <div className='bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm'>
              <div className='mb-5'>
                <h3 className='font-semibold text-xl text-text-primary'>
                  Customer Information
                </h3>
              </div>

              <div
                className={`flex w-full space-x-6 ${
                  !selectedCustomer ? 'items-center' : 'items-end'
                }`}
              >
                <div className='w-1/2 space-y-4'>
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
                      htmlFor='property-select'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Choose property <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative bg-white'>
                      <select
                        id='property-select'
                        value={selectedProperty}
                        onChange={handlePropertyChange}
                        required
                        disabled={!selectedCustomer}
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm appearance-none disabled:bg-gray-100'
                      >
                        <option value=''>Select a property...</option>
                        {customerProperties?.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.address}
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                        <ChevronDown className='w-5 h-5' />
                      </div>
                    </div>
                    {!selectedCustomer && (
                      <p className='text-sm text-gray-500 mt-1'>
                        Select a customer first to see their properties
                      </p>
                    )}
                  </div>
                </div>

                {selectedCustomerData ? (
                  <div className='w-1/2 bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
                    <div className='flex items-start space-x-3'>
                      <div className='w-9 h-9 bg-[#e6f4ed] rounded-full flex items-center justify-center flex-shrink-0'>
                        <Building2 className='w-5 h-5 text-[#356852]' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-gray-900 text-base'>
                          {selectedCustomerData.fullName}
                        </h4>
                        {selectedPropertyData && (
                          <p className='text-sm text-gray-600 mt-1'>
                            <MapPin className='w-4 h-4 inline mr-1' />
                            {selectedPropertyData.address}
                          </p>
                        )}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='w-1/2 min-h-34 bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 text-sm italic'>
                    <Info className='w-5 h-5 mr-2 text-gray-400' />
                    No customer selected.
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details and Dates */}
            <div className='space-y-6'>
              <h3 className='font-semibold text-xl text-text-primary'>
                Invoice Details
              </h3>
              <div>
                <label
                  htmlFor='issueDate'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Title <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={invoice.title}
                  onChange={handleChange}
                  placeholder='Title'
                  required
                  className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='issueDate'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Issue Date <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    id='issueDate'
                    name='issueDate'
                    value={invoice.issueDate}
                    onChange={handleChange}
                    required
                    className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm'
                  />
                </div>
                <div>
                  <label
                    htmlFor='paymentTerms'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Payment Terms <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <select
                      id='paymentTerms'
                      name='paymentTerms'
                      value={invoice.paymentTerms}
                      onChange={handleChange}
                      required
                      className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm appearance-none'
                    >
                      <option value='uponReceipt'>Upon receipt</option>
                      <option value='net15'>Net 15</option>
                      <option value='net30'>Net 30</option>
                      <option value='custom'>Custom Due Date</option>
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                      <ChevronDown className='w-5 h-5' />
                    </div>
                  </div>
                </div>
                {invoice.paymentTerms === 'custom' && (
                  <div>
                    <label
                      htmlFor='dueDate'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Custom Due Date <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      id='dueDate'
                      name='dueDate'
                      value={invoice.dueDate}
                      onChange={handleChange}
                      required
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm'
                    />
                  </div>
                )}
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
                {invoice.lineItems.map((item, index) => (
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
                              invoice,
                              index,
                              'name',
                              value,
                              setInvoice
                            );
                          }}
                          onFocus={() => setActiveSearchIndex(index)}
                          onBlur={() =>
                            setTimeout(() => setActiveSearchIndex(null), 200)
                          }
                          className='w-full p-2.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-transparent outline-none'
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
                                      invoice,
                                      index,
                                      service,
                                      setInvoice,
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
                          min='0'
                          step='0.001'
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(
                              invoice,
                              index,
                              'quantity',
                              Number(e.target.value) || 0,
                              setInvoice
                            )
                          }
                          className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-transparent outline-none'
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
                              invoice,
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0,
                              setInvoice
                            )
                          }
                          className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-transparent outline-none'
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
                              invoice,
                              index,
                              'description',
                              e.target.value,
                              setInvoice
                            )
                          }
                          className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-transparent resize-y outline-none'
                          placeholder='Add a description for this service item (optional)'
                        />
                      </div>

                      <div className='col-span-2'>
                        {invoice.lineItems.length > 1 && (
                          <ButtonIcon
                            name='Remove'
                            customTextStyle='text-red-500'
                            handleBtnClick={() =>
                              removeLineItem(invoice, index, setInvoice)
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
                  onClick={() => addNewLineItem(invoice, setInvoice)}
                  customStyle='py-2 px-4 text-white bg-bg-primary'
                >
                  Add Line Item
                </IconButton>
              </div>
            </div>

            {/* Pricing Summary and Discounts */}
            <div className=''>
              <div className='w-full flex justify-end mt-8 pt-6'>
                <div className='w-1/2 space-y-3'>
                  <div className='flex justify-between items-center text-sm text-gray-700 pr-6'>
                    <span>Subtotal:</span>
                    <span className='font-medium'>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm text-gray-700'>
                    <span className='text-gray-600'>Discount</span>
                    {isAddDiscount && (
                      <div className='max-w-[220px] flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                        <button
                          type='button'
                          onClick={() =>
                            setInvoice((prev) => ({
                              ...prev,
                              discountType:
                                prev.discountType === DiscountType.Percentage
                                  ? DiscountType.FixedAmount
                                  : DiscountType.Percentage,
                            }))
                          }
                          className='w-9 h-9 flex items-center cursor-pointer bg-gray-50 border-r border-gray-200 justify-center hover:bg-gray-100 transition-colors text-gray-600'
                        >
                          {invoice.discountType === DiscountType.Percentage ? (
                            <Percent className='w-4 h-4' />
                          ) : (
                            <DollarSign className='w-4 h-4' />
                          )}
                        </button>
                        <input
                          type='number'
                          name='discount'
                          value={invoice.discount}
                          onChange={handleChange}
                          min='0'
                          step={
                            invoice.discountType === DiscountType.Percentage
                              ? '0.01'
                              : '1'
                          }
                          className='px-2 py-1.5 w-full text-gray-900 outline-none text-base'
                          placeholder='0.00'
                        />
                      </div>
                    )}
                    {discountAmount === 0 && !isAddDiscount ? (
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
                        <span className='font-medium text-bg-primary'>
                          -{formatCurrency(discountAmount)}
                        </span>
                        <button
                          onClick={() => {
                            setIsAddDiscount(false);
                            setInvoice((prev) => ({
                              ...prev,
                              discount: 0,
                              discountType: DiscountType.Percentage, // Reset to default
                            }));
                          }}
                          className='cursor-pointer'
                        >
                          <Trash2 className='w-4.5 h-4.5 text-red-600' />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className='flex justify-between items-center text-sm text-gray-700'>
                    <span className='text-gray-600'>Tax</span>
                    {isAddTax && (
                      <div className='max-w-[220px] flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                        <button className='w-9 h-9 flex items-center border-r border-gray-200 justify-center text-gray-600'>
                          <Percent className='w-4 h-4' />
                        </button>
                        <input
                          type='number'
                          name='taxRate'
                          value={invoice.taxRate * 100}
                          onChange={(e) =>
                            setInvoice((prev) => ({
                              ...prev,
                              taxRate: parseFloat(e.target.value) / 100,
                            }))
                          }
                          min='0'
                          step='0.01'
                          className='px-2 py-1.5 w-full text-gray-900 outline-none text-base'
                          placeholder='0.00'
                        />
                      </div>
                    )}
                    {taxAmount === 0 && !isAddTax ? (
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
                        <span className='font-medium'>
                          {formatCurrency(taxAmount)}
                        </span>
                        <button
                          onClick={() => {
                            setIsAddTax(false);
                            setInvoice((prev) => ({
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
                  <div className='flex justify-between border-t border-gray-200 items-center text-lg font-bold text-gray-900 pt-2 mr-6'>
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className='mt-10 space-y-6'>
              <h3 className='font-semibold text-xl text-text-primary'>Notes</h3>

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
                    value={invoice.internalNotes}
                    onChange={handleChange}
                    rows={4}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm resize-y'
                    placeholder='Internal notes (not visible to customer)...'
                  />
                </div>
                <div>
                  <label
                    htmlFor='notes'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Customer Notes
                  </label>
                  <textarea
                    id='notes'
                    name='notes'
                    value={invoice.notes}
                    onChange={handleChange}
                    rows={4}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-transparent text-sm resize-y'
                    placeholder='Notes visible to customer on the invoice...'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className='sticky bottom-0 bg-white z-10 px-8 py-4 border-t border-gray-100'>
          <div className='flex items-center justify-end space-x-3'>
            <CustomButton
              onClick={onClose}
              customStyle='px-5 py-2.5 shadow-sm border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleCreateInvoice}
              customStyle='px-5 py-2.5 bg-bg-primary text-white hover:bg-bg-primary-hover'
            >
              Create Invoice
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
