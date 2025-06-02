import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  User,
  FileText,
  Calculator,
  Settings,
  Building2,
  Mail,
  Phone,
  ChevronDown,
  Search,
} from 'lucide-react';
import { QuoteStatus } from '../../../constants/Enumeration/QuoteEnum';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import { TAddQuote } from '../../../types/Quote';
import { GetAllCustomers } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import { GetServiceItems } from '../../../services/ServiceItem';
import { TServiceItem } from '../../../types/ServiceItem';
import { CreateQuote } from '../../../services/Quote';
import { useAuth } from '../../../context/AuthProvider';

enum DiscountType {
  Percentage,
  FixedAmount,
}

const NewQuoteModal = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [newQuote, setNewQuote] = useState<TAddQuote>({
    workspaceId: '',
    status: QuoteStatus.Draft,
    createdBy: '',
    customerId: '',
    lineItems: [],
    discountType: DiscountType.Percentage,
    discountAmount: 0,
    tax: 0,
    notes: '',
    internalNotes: '',
    attachmentUrls: [],
  });

  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const numericFields = ['status', 'discountType', 'tax', 'discountAmount'];
    const parsedValue = numericFields.includes(name) ? Number(value) : value;

    setNewQuote((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(e.target.value);
    setNewQuote((prev) => ({
      ...prev,
      customerId: e.target.value,
    }));
  };

  const handleAddLineItem = () => {
    setNewQuote((prev) => ({
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

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    setNewQuote((prev) => {
      const updatedItems = [...prev.lineItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        updatedItems[index].total =
          updatedItems[index].quantity * updatedItems[index].unitPrice;
      }

      return { ...prev, lineItems: updatedItems };
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setNewQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const updatedQuote = {
      ...newQuote,
      workspaceId: user?.workspace.id,
      createdBy: user?.id,
    };
    const response = await CreateQuote(updatedQuote);
    if (response.status === 200) {
      onClose();
    }
    console.log('Quote submitted:', newQuote);
  };

  // Calculate totals
  const subtotal = newQuote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountAmount =
    newQuote.discountType === DiscountType.Percentage
      ? subtotal * (newQuote.discountAmount / 100)
      : newQuote.discountAmount;
  const taxAmount = (subtotal - discountAmount) * (newQuote.tax / 100);
  const total = subtotal - discountAmount + taxAmount;

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  const fetchCustomers = async () => {
    const response = await GetAllCustomers();
    if (response.status === 200) {
      setCustomers(response.data.payload);
    }
  };

  const fetchServiceItems = async () => {
    const response = await GetServiceItems();
    if (response.status === 200) {
      setServiceItems(response.data.payload);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchServiceItems();
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center px-8 py-6 border-b border-gray-100'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center'>
              <FileText className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Create New Quote
              </h2>
              <p className='text-gray-600 text-sm'>
                Fill in all required fields to create a new quote
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        <div className='flex-1 overflow-hidden flex'>
          {/* Main Content */}
          <div className='flex-1 overflow-y-auto p-8'>
            <form onSubmit={handleSubmit} className='space-y-8'>
              {/* Customer Section */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <User className='w-5 h-5 mr-3 text-blue-600' />
                  Customer Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Select Customer
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Search className='w-5 h-5 text-gray-400' />
                        </div>
                        <select
                          value={selectedCustomer}
                          onChange={handleCustomerChange}
                          required
                          className='pl-10 pr-10 w-full py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none'
                        >
                          <option value=''>Choose a customer...</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                      </div>
                    </div>
                  </div>

                  {selectedCustomerData && (
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <div className='flex items-start space-x-3'>
                        <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <Building2 className='w-5 h-5 text-blue-600' />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900'>
                            {selectedCustomerData.fullName}
                          </h4>
                          <div className='mt-1 space-y-1 text-sm text-gray-600'>
                            <div className='flex items-center'>
                              <Mail className='w-4 h-4 mr-2' />
                              <span>{selectedCustomerData.email?.[0]}</span>
                            </div>
                            <div className='flex items-center'>
                              <Phone className='w-4 h-4 mr-2' />
                              <span>
                                {
                                  selectedCustomerData.customerPhones?.[0]
                                    .phoneNumber
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Section */}
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                    <FileText className='w-5 h-5 mr-3 text-blue-600' />
                    Line Items
                  </h3>
                  <button
                    type='button'
                    onClick={handleAddLineItem}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors text-sm'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Item
                  </button>
                </div>

                {newQuote.lineItems.length === 0 ? (
                  <div className='bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300'>
                    <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <FileText className='w-6 h-6 text-gray-500' />
                    </div>
                    <h4 className='text-base font-medium text-gray-900 mb-2'>
                      No items added yet
                    </h4>
                    <p className='text-gray-500 mb-4 text-sm'>
                      Add items to create your quote
                    </p>
                    <button
                      type='button'
                      onClick={handleAddLineItem}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors text-sm'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {newQuote.lineItems.map((item, index) => (
                      <div
                        key={index}
                        className='bg-white rounded-lg border border-gray-200 p-4'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
                          <div className='md:col-span-5'>
                            <select
                              value={item.serviceItemId || ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const selectedItem = serviceItems.find(
                                  (si) => si.serviceItemId === selectedId
                                );
                                if (selectedItem) {
                                  handleUpdateLineItem(
                                    index,
                                    'serviceItemId',
                                    selectedId
                                  );
                                  handleUpdateLineItem(
                                    index,
                                    'name',
                                    selectedItem.name
                                  );
                                  handleUpdateLineItem(
                                    index,
                                    'unitPrice',
                                    selectedItem.unitPrice
                                  );
                                  handleUpdateLineItem(
                                    index,
                                    'description',
                                    selectedItem.description
                                  );
                                }
                              }}
                              className='w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                            >
                              <option value=''>Custom Item</option>
                              {serviceItems.map((si) => (
                                <option
                                  key={si.serviceItemId}
                                  value={si.serviceItemId}
                                >
                                  {si.name} - {formatCurrency(si.unitPrice)}
                                </option>
                              ))}
                            </select>
                            <input
                              type='text'
                              value={item.name}
                              onChange={(e) =>
                                handleUpdateLineItem(
                                  index,
                                  'name',
                                  e.target.value
                                )
                              }
                              placeholder='Item name'
                              className='w-full p-2 mt-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm'
                              required
                            />
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateLineItem(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder='Item description...'
                              rows={2}
                              className='w-full p-2 mt-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600 resize-none'
                            />
                          </div>

                          <div className='md:col-span-2'>
                            <label className='block text-xs font-medium text-gray-500 mb-1'>
                              Quantity
                            </label>
                            <input
                              type='number'
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateLineItem(
                                  index,
                                  'quantity',
                                  parseFloat(e.target.value)
                                )
                              }
                              min='0.01'
                              step='0.01'
                              className='w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                            />
                          </div>

                          <div className='md:col-span-2'>
                            <label className='block text-xs font-medium text-gray-500 mb-1'>
                              Unit Price
                            </label>
                            <input
                              type='number'
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateLineItem(
                                  index,
                                  'unitPrice',
                                  parseFloat(e.target.value)
                                )
                              }
                              step='0.01'
                              min='0'
                              className='w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                            />
                          </div>

                          <div className='md:col-span-2 flex items-end'>
                            <div className='w-full'>
                              <label className='block text-xs font-medium text-gray-500 mb-1'>
                                Total
                              </label>
                              <div className='p-2 bg-gray-50 rounded-lg text-sm font-medium'>
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </div>
                            </div>
                          </div>

                          <div className='md:col-span-1 flex items-center justify-end'>
                            <button
                              type='button'
                              onClick={() => handleRemoveLineItem(index)}
                              className='w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Calculator className='w-5 h-5 mr-3 text-blue-600' />
                  Pricing & Adjustments
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <h4 className='font-medium text-gray-900 mb-3'>Subtotal</h4>
                    <div className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(subtotal)}
                    </div>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <div className='flex justify-between items-center mb-2'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Tax Rate (%)
                      </label>
                      <input
                        type='number'
                        name='tax'
                        value={newQuote.tax}
                        onChange={handleChange}
                        min='0'
                        step='0.01'
                        className='w-20 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                      />
                    </div>
                    <div className='text-lg font-medium text-gray-900'>
                      Tax Amount: {formatCurrency(taxAmount)}
                    </div>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <div className='space-y-3'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Discount Type
                        </label>
                        <select
                          name='discountType'
                          value={newQuote.discountType}
                          onChange={handleChange}
                          className='w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                        >
                          <option value={DiscountType.Percentage}>
                            Percentage (%)
                          </option>
                          <option value={DiscountType.FixedAmount}>
                            Fixed Amount ($)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Discount Value
                        </label>
                        <input
                          type='number'
                          name='discountAmount'
                          value={newQuote.discountAmount}
                          onChange={handleChange}
                          min='0'
                          step={
                            newQuote.discountType === DiscountType.Percentage
                              ? '0.01'
                              : '1'
                          }
                          className='w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                        />
                      </div>
                      {newQuote.discountAmount > 0 && (
                        <div className='text-green-600 font-medium'>
                          -{formatCurrency(discountAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Settings className='w-5 h-5 mr-3 text-blue-600' />
                  Notes
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Customer Notes
                    </label>
                    <textarea
                      name='notes'
                      value={newQuote.notes}
                      onChange={handleChange}
                      rows={3}
                      className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm'
                      placeholder='Notes visible to customer...'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Internal Notes
                    </label>
                    <textarea
                      name='internalNotes'
                      value={newQuote.internalNotes}
                      onChange={handleChange}
                      rows={3}
                      className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm'
                      placeholder='Internal notes (not visible to customer)...'
                    />
                  </div>
                </div>
              </div>

              {/* Total & Actions */}
              <div className='pt-6 border-t border-gray-200'>
                <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
                  <div className='bg-blue-50 rounded-lg p-4 w-full md:w-auto'>
                    <div className='flex items-center space-x-4'>
                      <div className='text-sm text-gray-600'>Quote Total:</div>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formatCurrency(total)}
                      </div>
                    </div>
                  </div>

                  <div className='flex space-x-3 w-full md:w-auto'>
                    <button
                      type='button'
                      onClick={onClose}
                      className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto'
                    >
                      Create Quote
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuoteModal;
