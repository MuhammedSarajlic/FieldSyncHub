import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Home } from 'lucide-react';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit?: (quoteData: QuoteData) => void;
  customers?: Customer[];
  properties?: Property[];
  priceBookItems?: PriceBookItem[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Property {
  id: string;
  customerId: string;
  address: string;
}

interface PriceBookItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: string;
}

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
  fromPriceBook: boolean;
  priceBookItemId?: string;
}

interface QuoteData {
  customerId: string;
  propertyId: string | null;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  notes: string;
  customerMessage: string;
  expirationDate: string;
}

const NewQuoteModal: React.FC<NewQuoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  properties,
  priceBookItems,
}) => {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    customerId: '',
    propertyId: null,
    items: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    totalAmount: 0,
    status: 'Draft',
    notes: '',
    customerMessage: '',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days from now
  });

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerProperties, setCustomerProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPriceBookItems, setFilteredPriceBookItems] = useState<
    PriceBookItem[]
  >([]);

  // Filter properties when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const filtered = properties.filter(
        (prop) => prop.customerId === selectedCustomer
      );
      setCustomerProperties(filtered);

      // Reset property selection if current selection doesn't belong to new customer
      if (
        quoteData.propertyId &&
        !filtered.find((p) => p.id === quoteData.propertyId)
      ) {
        setQuoteData((prev) => ({
          ...prev,
          propertyId: null,
        }));
      }

      // Update customerId in quoteData
      setQuoteData((prev) => ({
        ...prev,
        customerId: selectedCustomer,
      }));
    } else {
      setCustomerProperties([]);
    }
  }, [selectedCustomer, properties]);

  // Filter pricebook items based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPriceBookItems(priceBookItems);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = priceBookItems.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseSearch) ||
          item.description.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredPriceBookItems(filtered);
    }
  }, [searchTerm, priceBookItems]);

  // Recalculate totals when items, tax rate, or discount changes
  useEffect(() => {
    const subtotal = quoteData.items.reduce((sum, item) => sum + item.total, 0);

    let discountAmount = 0;
    if (quoteData.discountType === 'percentage') {
      discountAmount = subtotal * (quoteData.discountValue / 100);
    } else {
      discountAmount = quoteData.discountValue;
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (quoteData.taxRate / 100);
    const total = afterDiscount + taxAmount;

    setQuoteData((prev) => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount: total,
    }));
  }, [
    quoteData.items,
    quoteData.taxRate,
    quoteData.discountType,
    quoteData.discountValue,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setQuoteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(e.target.value);
  };

  const handleAddPriceBookItem = (item: PriceBookItem) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: item.name,
      description: item.description,
      quantity: 1,
      unitPrice: item.unitPrice,
      unit: item.unit,
      total: item.unitPrice,
      fromPriceBook: true,
      priceBookItemId: item.id,
    };

    setQuoteData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleAddCustomItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'ea',
      total: 0,
      fromPriceBook: false,
    };

    setQuoteData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteData((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total if quantity or unit price changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleRemoveItem = (id: string) => {
    setQuoteData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(quoteData);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Create New Quote
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <h3 className='text-lg font-medium text-gray-800 mb-4'>
                Customer Information
              </h3>

              <div className='space-y-4'>
                {/* Customer Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Customer*
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <User size={16} className='text-gray-400' />
                    </div>
                    <select
                      value={selectedCustomer}
                      onChange={handleCustomerChange}
                      required
                      className='pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Customer</option>
                      {/* {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))} */}
                    </select>
                  </div>
                </div>

                {/* Property Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Property (Optional)
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Home size={16} className='text-gray-400' />
                    </div>
                    <select
                      name='propertyId'
                      value={quoteData.propertyId || ''}
                      onChange={handleChange}
                      disabled={!selectedCustomer}
                      className='pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Property</option>
                      {customerProperties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Expiration Date
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Calendar size={16} className='text-gray-400' />
                    </div>
                    <input
                      type='date'
                      name='expirationDate'
                      value={quoteData.expirationDate}
                      onChange={handleChange}
                      className='pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-800 mb-4'>
                Quote Settings
              </h3>

              <div className='space-y-4'>
                {/* Status */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Status
                  </label>
                  <select
                    name='status'
                    value={quoteData.status}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='Draft'>Draft</option>
                    <option value='Awaiting Response'>Awaiting Response</option>
                    <option value='Approved'>Approved</option>
                    <option value='Declined'>Declined</option>
                    <option value='Changes Requested'>Changes Requested</option>
                  </select>
                </div>

                {/* Tax Rate */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tax Rate (%)
                  </label>
                  <input
                    type='number'
                    name='taxRate'
                    value={quoteData.taxRate}
                    onChange={handleChange}
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                {/* Discount */}
                <div className='grid grid-cols-3 gap-2'>
                  <div className='col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Discount Type
                    </label>
                    <select
                      name='discountType'
                      value={quoteData.discountType}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='percentage'>Percentage (%)</option>
                      <option value='fixed'>Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Discount Value
                    </label>
                    <input
                      type='number'
                      name='discountValue'
                      value={quoteData.discountValue}
                      onChange={handleChange}
                      min='0'
                      step={
                        quoteData.discountType === 'percentage' ? '0.01' : '1'
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-800'>Quote Items</h3>
              <button
                type='button'
                onClick={handleAddCustomItem}
                className='px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center'
              >
                <Plus size={16} className='mr-1' /> Add Custom Item
              </button>
            </div>

            {/* Price Book Search */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Search Price Book
              </label>
              <input
                type='text'
                placeholder='Search for items...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {searchTerm && (
                <div className='mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md'>
                  {filteredPriceBookItems.length > 0 ? (
                    <ul className='divide-y divide-gray-200'>
                      {filteredPriceBookItems.map((item) => (
                        <li
                          key={item.id}
                          className='p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center'
                          onClick={() => handleAddPriceBookItem(item)}
                        >
                          <div>
                            <div className='font-medium'>{item.name}</div>
                            <div className='text-sm text-gray-500'>
                              {item.description}
                            </div>
                          </div>
                          <div className='flex items-center'>
                            <span className='mr-3 font-medium'>
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <Plus size={16} className='text-blue-500' />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className='p-3 text-center text-gray-500'>
                      No items found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quote Items Table */}
            <div className='overflow-x-auto border border-gray-200 rounded-md'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3'>
                      Item
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Quantity
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Unit
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Unit Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total
                    </th>
                    <th className='px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {quoteData.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-4 text-center text-sm text-gray-500'
                      >
                        No items added yet. Search the price book or add a
                        custom item.
                      </td>
                    </tr>
                  ) : (
                    quoteData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className='px-4 py-2'>
                          <input
                            type='text'
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'name', e.target.value)
                            }
                            placeholder='Item name'
                            className='w-full p-1 border border-gray-300 rounded'
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Description'
                            rows={2}
                            className='w-full p-1 mt-1 border border-gray-300 rounded text-sm'
                          />
                        </td>
                        <td className='px-4 py-2'>
                          <input
                            type='number'
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'quantity',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min='0.01'
                            step='0.01'
                            className='w-full p-1 border border-gray-300 rounded'
                          />
                        </td>
                        <td className='px-4 py-2'>
                          <input
                            type='text'
                            value={item.unit}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'unit', e.target.value)
                            }
                            className='w-full p-1 border border-gray-300 rounded'
                          />
                        </td>
                        <td className='px-4 py-2'>
                          <input
                            type='number'
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'unitPrice',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min='0'
                            step='0.01'
                            className='w-full p-1 border border-gray-300 rounded'
                          />
                        </td>
                        <td className='px-4 py-2 font-medium'>
                          {formatCurrency(item.total)}
                        </td>
                        <td className='px-4 py-2 text-right'>
                          <button
                            type='button'
                            onClick={() => handleRemoveItem(item.id)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className='bg-gray-50'>
                  <tr>
                    <td
                      colSpan={4}
                      className='px-4 py-2 text-right font-medium'
                    >
                      Subtotal:
                    </td>
                    <td className='px-4 py-2 font-medium'>
                      {formatCurrency(quoteData.subtotal)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className='px-4 py-2 text-right font-medium'
                    >
                      Discount (
                      {quoteData.discountType === 'percentage'
                        ? quoteData.discountValue + '%'
                        : 'Fixed'}
                      ):
                    </td>
                    <td className='px-4 py-2 font-medium text-red-500'>
                      -{formatCurrency(quoteData.discountAmount)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className='px-4 py-2 text-right font-medium'
                    >
                      Tax ({quoteData.taxRate}%):
                    </td>
                    <td className='px-4 py-2 font-medium'>
                      {formatCurrency(quoteData.taxAmount)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className='border-t-2 border-gray-300'>
                    <td
                      colSpan={4}
                      className='px-4 py-2 text-right font-bold text-lg'
                    >
                      Total:
                    </td>
                    <td className='px-4 py-2 font-bold text-lg'>
                      {formatCurrency(quoteData.totalAmount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Message and Notes Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Customer Message (Visible to Customer)
              </label>
              <textarea
                name='customerMessage'
                value={quoteData.customerMessage}
                onChange={handleChange}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter a message that will be visible to the customer...'
              ></textarea>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Internal Notes (Not Visible to Customer)
              </label>
              <textarea
                name='notes'
                value={quoteData.notes}
                onChange={handleChange}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter notes for internal use only...'
              ></textarea>
            </div>
          </div>

          <div className='flex justify-end gap-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Create Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewQuoteModal;
