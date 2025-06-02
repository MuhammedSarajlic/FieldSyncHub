import { useEffect, useState, useCallback } from 'react';
import { X, Calendar, Clock, Plus, Save } from 'lucide-react';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomIconButton from '../../CustomElements/CustomIconButton';
import { GetAllCustomers } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import { TServiceItem } from '../../../types/ServiceItem';
import { GetServiceItemsByFilter } from '../../../services/ServiceItem';
import CustomButton from '../../CustomElements/CustomButton';
import { TInvoice, TUpdateInvoice } from '../../../types/Invoice';
import { TAddLineItem } from '../../../types/LineItem';
import { useAuth } from '../../../context/AuthProvider';
import { updateInvoice } from '../../../services/Invoice';

interface ICreateInvoiceModal {
  isOpen: boolean;
  onClose: () => void;
  invoice: TInvoice;
}

const UpdateInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
}: ICreateInvoiceModal) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>();
  const [serviceSuggestions, setServiceSuggestions] = useState<{
    [key: number]: TServiceItem[];
  }>({});
  const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [updatedInvoice, setUpdatedInvoice] = useState<TUpdateInvoice>(invoice);

  const debouncedSearch = useCallback((query: string) => {
    if (!query) {
      setServiceItems([]);
    } else {
      searchServiceItems(query);
    }
  }, []);

  const searchServiceItems = async (query: string) => {
    if (!query) {
      setServiceItems([]);
      return;
    }

    const response = await GetServiceItemsByFilter(
      `q=${encodeURIComponent(query)}`
    );

    if (response.status === 200) {
      setServiceItems(response.data.payload || []);
    }
  };

  const handleAddItem = () => {
    setUpdatedInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: [
        ...prevInvoice.items,
        { name: '', description: '', quantity: 1, unitPrice: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setUpdatedInvoice((prevInvoice) => {
      const newItems = prevInvoice.items.filter((_, i) => i !== index);
      return {
        ...prevInvoice,
        items:
          newItems.length > 0
            ? newItems
            : [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
      };
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof TAddLineItem | 'name',
    value: any
  ) => {
    setUpdatedInvoice((prevInvoice) => {
      const newItems = [...prevInvoice.items];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'name') {
          debouncedSearch(value);
          setFocusedIndex(index);
        }
      }
      return { ...prevInvoice, items: newItems };
    });
  };

  const subtotal = updatedInvoice.items.reduce(
    (sum, item) => sum + item.quantity * (item.unitPrice ?? 0),
    0
  );

  const taxableAmount = subtotal;
  const tax = taxableAmount * updatedInvoice.taxRate;
  const discountAmount =
    updatedInvoice.discountType === 'percentage'
      ? subtotal * (updatedInvoice.discount / 100)
      : updatedInvoice.discount;
  const total = subtotal + tax - discountAmount;

  const selectServiceItem = (index: number, service: TServiceItem) => {
    setUpdatedInvoice((prevInvoice) => {
      const updatedItems = [...prevInvoice.items];
      if (updatedItems[index]) {
        updatedItems[index] = {
          name: service.name,
          unitPrice: service.unitPrice,
          description: service.description,
          quantity: updatedItems[index].quantity ?? 1,
          serviceItemId: service.serviceItemId,
        };
      }
      return { ...prevInvoice, items: updatedItems };
    });
    setServiceSuggestions((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  useEffect(() => {
    const newSuggestions: { [key: number]: TServiceItem[] } = {};
    updatedInvoice.items.forEach((item, index) => {
      if (item.name && focusedIndex === index) {
        // Only filter if this input is focused
        const filtered = serviceItems
          .filter((s) =>
            s.name?.toLowerCase().includes(item.name.toLowerCase())
          )
          .slice(0, 5); // max 5 results
        newSuggestions[index] = filtered;
      } else if (item.name && focusedIndex === null) {
        newSuggestions[index] = [];
      }
    });
    setServiceSuggestions(newSuggestions);
  }, [serviceItems, updatedInvoice.items, focusedIndex]);

  const handleUpdateInvoice = async () => {
    if (!updatedInvoice) return;

    try {
      // Example service call to update
      const response = await updateInvoice(invoice.invoiceId, updatedInvoice);
      if (response.status === 200) {
        alert('Invoice updated successfully!');
        onClose();
      } else {
        alert('Failed to update invoice');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('An error occurred while updating invoice.');
    }
  };

  const fetchAllCustomers = async () => {
    const response = await GetAllCustomers();
    if (response.status === 200) {
      setCustomers(response.data.payload);
    }
  };

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-2/3 max-h-[90vh] flex flex-col overflow-hidden border border-gray-200'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-heading'>Update Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer'
          >
            <X className='w-5.5 h-5.5' />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-auto p-6'>
          {/* Customer and Date Selection */}
          <div className='flex flex-col md:flex-row gap-16 mb-10'>
            {/* Left: Customer Selection (2/3 width) */}
            <div className='w-full md:w-2/3 space-y-4'>
              {/* <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Customer
                </label>
                <div className='flex items-center gap-2.5'>
                  <select
                    onChange={(e) =>
                      setUpdatedInvoice((prev) => ({
                        ...prev,
                        customerId: e.target.value,
                      }))
                    }
                    className='w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                  >
                    <option value=''>Select a customer</option>
                    {customers &&
                      customers.length > 0 &&
                      customers.map((customer) => (
                        <option
                          key={customer.customerId}
                          value={customer.customerId}
                        >
                          {customer.firstName} {customer.lastName}
                        </option>
                      ))}
                  </select>
                  <span className='text-sm text-primary'>or</span>
                  <CustomIconButton
                    icon={<Plus className='w-4 h-4 sm:w-4 sm:h-4 mr-1' />}
                    text='Create Customer'
                    handleClick={() => alert('Open Create Customer Modal')}
                  />
                </div>
              </div> */}

              {customers && (
                <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
                  <h4 className='text-sm font-medium text-gray-700 mb-2'>
                    Customer Details
                  </h4>
                  <p className='text-sm text-gray-800'>
                    <strong>Name:</strong>{' '}
                    {
                      customers.find(
                        (c) => c.id.toString() === updatedInvoice.customerId
                      )?.fullName
                    }
                  </p>
                  <p className='text-sm text-gray-800'>
                    <strong>Email:</strong>{' '}
                    {
                      customers.find(
                        (c) => c.id.toString() === updatedInvoice.customerId
                      )?.email[0]
                    }
                  </p>
                  <p className='text-sm text-gray-800'>
                    <strong>Property:</strong> 123 Main St, Springfield
                  </p>
                  <p className='text-sm text-gray-800'>
                    <strong>Contact:</strong> (555) 123-4567
                  </p>
                </div>
              )}
            </div>

            {/* Right: Dates and Payment Terms (1/3 width) */}
            <div className='w-full md:w-1/3 space-y-4'>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Issue Date
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    value={updatedInvoice.issueDate.split('T')[0]}
                    onChange={(e) =>
                      setUpdatedInvoice((prev) => ({
                        ...prev,
                        issueDate: e.target.value,
                      }))
                    }
                    className='w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <Calendar className='w-4 h-4 text-gray-400' />
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Payment Terms
                </label>
                <select
                  value={updatedInvoice.paymentTerms}
                  onChange={(e) =>
                    setUpdatedInvoice((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value,
                      customDueDate:
                        e.target.value !== 'custom'
                          ? undefined
                          : prev.customDueDate,
                    }))
                  }
                  className='w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                >
                  <option value='uponReceipt'>Upon receipt</option>
                  <option value='net15'>Net 15</option>
                  <option value='net30'>Net 30</option>
                  <option value='custom'>Custom Due Date</option>
                </select>
              </div>

              {updatedInvoice.paymentTerms === 'custom' && (
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Due Date
                  </label>
                  <div className='relative'>
                    <input
                      type='date'
                      value={updatedInvoice.dueDate}
                      onChange={(e) =>
                        setUpdatedInvoice((prev) => ({
                          ...prev,
                          customDueDate: e.target.value,
                        }))
                      }
                      className='w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                      <Clock className='w-4 h-4 text-gray-400' />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className='mb-8'>
            <div className='flex justify-end items-center mb-4'>
              <button
                onClick={handleAddItem}
                className='flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                <Plus className='w-4 h-4 mr-1' />
                Add Line Item
              </button>
            </div>

            {/* Header Row */}
            <div className='grid grid-cols-12 gap-4 font-semibold mb-2'>
              <div className='col-span-6'>Service</div>
              <div className='col-span-2'>Qty</div>
              <div className='col-span-2'>Unit Price</div>
              <div className='col-span-2 text-right'>Total</div>
            </div>

            <div className='space-y-6'>
              {updatedInvoice.items.map((item, index) => (
                <div key={index} className='space-y-1'>
                  {/* Line 1 */}
                  <div className='grid grid-cols-12 gap-4 items-center'>
                    <div className='col-span-6 relative'>
                      <input
                        type='text'
                        value={item.name ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleItemChange(index, 'name', value);
                        }}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => {
                          // Optionally, you might want a slight delay here if clicking a suggestion isn't immediate
                          setTimeout(() => setFocusedIndex(null), 100);
                        }}
                        className='w-full p-2 text-sm font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                        placeholder='Service name'
                      />

                      {focusedIndex === index &&
                        serviceSuggestions[index] &&
                        serviceSuggestions[index].length > 0 && (
                          <div className='absolute z-50 w-full bg-white border border-gray-200 rounded shadow-sm'>
                            {serviceSuggestions[index].map((service) => (
                              <div
                                key={service.serviceItemId}
                                className='px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer'
                                onClick={() => {
                                  selectServiceItem(index, service);
                                  setFocusedIndex(null);
                                }}
                              >
                                {service.name} - ${service.unitPrice}
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
                          handleItemChange(
                            index,
                            'quantity',
                            parseInt(e.target.value)
                          )
                        }
                        className='w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                      />
                    </div>

                    <div className='col-span-2'>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        value={item.unitPrice ?? 0.0}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value)
                          )
                        }
                        className='w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                      />
                    </div>

                    <div className='col-span-2 text-right text-sm font-semibold text-gray-900'>
                      $
                      {((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(
                        2
                      )}
                    </div>
                  </div>

                  {/* Line 2 (Description + Remove) */}
                  <div className='grid grid-cols-12 gap-4 items-start'>
                    <div className='col-span-6'>
                      <textarea
                        rows={2}
                        value={item.description ?? ''}
                        onChange={(e) =>
                          handleItemChange(index, 'description', e.target.value)
                        }
                        className='w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                        placeholder='Description'
                      />
                    </div>

                    <div className='col-span-2 text-right pt-1.5'>
                      {updatedInvoice.items.length > 1 && (
                        <ButtonIcon
                          name='Remove'
                          customTextStyle='text-red-500'
                          handleBtnClick={() => handleRemoveItem(index)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary & Adjustments */}
          <div className='mb-8'>
            <div className='p-4 border border-gray-200 rounded-lg space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Discount */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Discount
                  </label>
                  <div className='flex items-center gap-3'>
                    <select
                      value={updatedInvoice.discountType}
                      onChange={(e) =>
                        setUpdatedInvoice((prev) => ({
                          ...prev,
                          discountType: e.target.value,
                        }))
                      }
                      className='p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                    >
                      <option value='percentage'>%</option>
                      <option value='fixed'>$</option>
                    </select>
                    <input
                      type='number'
                      min='0'
                      step='0.1'
                      value={updatedInvoice.discount}
                      onChange={(e) =>
                        setUpdatedInvoice((prev) => ({
                          ...prev,
                          discount: parseFloat(e.target.value),
                        }))
                      }
                      className='w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                      placeholder='Discount amount'
                    />
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tax Rate
                  </label>
                  <div className='relative'>
                    <input
                      type='number'
                      min='0'
                      max='100'
                      step='0.1'
                      value={updatedInvoice.taxRate * 100}
                      onChange={(e) =>
                        setUpdatedInvoice((prev) => ({
                          ...prev,
                          taxRate: parseFloat(e.target.value) / 100,
                        }))
                      }
                      className='w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500'
                    />
                    <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 text-sm'>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='pt-2 border-t border-gray-100'>
                <div className='flex justify-between text-sm text-gray-700 mb-1'>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700 mb-1'>
                  <span>Discount</span>
                  <span className='text-red-600'>
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-700 mb-1'>
                  <span>Tax ({updatedInvoice.taxRate * 100}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-lg font-bold pt-2 border-t border-gray-100 mt-2'>
                  <span>Total</span>
                  <span className='text-blue-600'>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className='mb-8'>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Customer Notes
                </label>
                <textarea
                  rows={3}
                  value={updatedInvoice.notes}
                  onChange={(e) =>
                    setUpdatedInvoice((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className='w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Visible to the customer'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={updatedInvoice.internalNotes}
                  onChange={(e) =>
                    setUpdatedInvoice((prev) => ({
                      ...prev,
                      internalNotes: e.target.value,
                    }))
                  }
                  className='w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='For your team only'
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='py-4  bg-white flex justify-between'>
            <ButtonIcon name='Cancel' handleBtnClick={onClose} />
            <div className='flex space-x-3'>
              <button
                onClick={() => {
                  console.log(updatedInvoice);
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center'
              >
                <Save className='w-4 h-4 mr-2' />
                Save Draft
              </button>
              <CustomButton
                title='Send Invoice'
                handleBtnClick={handleUpdateInvoice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateInvoiceModal;
