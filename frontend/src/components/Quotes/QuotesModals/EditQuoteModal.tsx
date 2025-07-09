import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Plus,
  User,
  Percent,
  DollarSign,
  CheckSquare,
  Trash2,
  User2,
} from 'lucide-react';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { TUpdateQuote } from '../../../types/Quote';
import { GetEmployeesByWorkspace } from '../../../services/Employee';
import { TEmployee } from '../../../types/Employee';
import { useAuth } from '../../../context/AuthProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import { useClickOutside } from '../../../hooks/useClickOutside';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import IconButton from '../../CustomElements/Buttons/IconButton';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';

interface IEditQuoteModal {
  isOpen?: boolean;
  onClose: () => void;
  quote: TUpdateQuote;
  setQuote: React.Dispatch<React.SetStateAction<TUpdateQuote | null>>;
}

const EditQuoteModal = ({
  isOpen,
  onClose,
  quote,
  setQuote,
}: IEditQuoteModal) => {
  const { user } = useAuth();
  const [updateQuote, setUpdateQuote] = useState<TUpdateQuote>(quote);

  const [isAddDiscount, setIsAddDiscount] = useState<boolean>(false);
  const [isAddTax, setIsAddTax] = useState<boolean>(false);

  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<TEmployee[]>([]);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState<boolean>(false);
  const [assignedUserName, setAssignedUserName] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, 300);
  const [isAssignedUserLoading, setIsAssignedUserLoading] = useState(false);
  const assignUserRef = useClickOutside<HTMLDivElement>(() =>
    setIsAssignUserOpen(false)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ['discountType', 'discountValue', 'taxRate'];
    const parsedValue = numericFields.includes(name) ? Number(value) : value;
    setUpdateQuote((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const calculateQuoteTotals = () => {
    const subtotal = updateQuote.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount =
      updateQuote.discountType === DiscountType.Percentage
        ? subtotal * (updateQuote.discountValue / 100)
        : updateQuote.discountValue;
    const taxAmount = (subtotal - discountAmount) * (updateQuote.taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateQuoteTotals();

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setUpdateQuote((prev) => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = { ...newLineItems[index], [field]: value };
      return { ...prev, lineItems: newLineItems };
    });
  };

  const addNewLineItem = () => {
    setUpdateQuote((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { quantity: 1, name: '', unitPrice: 0, description: '' },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    setUpdateQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col'>
        <div className='sticky top-0 bg-white z-10 flex justify-between items-center px-8 py-5 border-b border-gray-100 shadow-sm'>
          <h2 className='text-2xl font-bold text-text-primary'>Edit Quote</h2>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-8 py-6'>
          <div className='space-y-6'>
            <div className='flex items-center space-x-6'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Title
                </label>
                <input
                  name='title'
                  value={updateQuote.title}
                  onChange={handleChange}
                  className='border border-gray-300 rounded-lg w-full p-2.5 text-sm'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Source
                </label>
                <input
                  name='source'
                  value={updateQuote.source}
                  onChange={handleChange}
                  className='border border-gray-300 rounded-lg w-full p-2.5 text-sm'
                />
              </div>
            </div>

            <div>
              <p className='block text-sm font-medium text-gray-700 mb-2'>
                Assigned To
              </p>
              {updateQuote.assignedToUserId ? (
                <div className='w-full p-1 flex items-center space-x-2 rounded-full bg-gray-200'>
                  <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center'>
                    <User className='w-5 h-5' />
                  </div>
                  <p className='text-sm text-text-primary'>
                    {assignedUserName}
                  </p>
                  <button
                    onClick={() =>
                      setUpdateQuote((prev) => ({
                        ...prev,
                        assignedToUserId: '',
                      }))
                    }
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
                    icon={<Plus className='w-4 h-4 text-bg-primary mr-1' />}
                    customStyle='!rounded-full py-1.5 px-4 !text-bg-primary hover:border-gray-300'
                  >
                    Assign user
                  </IconButton>
                  {isAssignUserOpen && (
                    <div className='absolute min-w-[350px] left-0 mt-2 z-50 py-2 flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl'>
                      <div className='px-2'>
                        <input
                          placeholder='Search...'
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className='outline-none border-b border-gray-200 w-full px-2 pb-2 text-sm'
                        />
                      </div>
                      {isAssignedUserLoading ? (
                        <div className='flex justify-center p-6'>
                          <div className='w-5 h-5 border-2 border-gray-300 border-t-bg-primary rounded-full animate-spin'></div>
                        </div>
                      ) : filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            onClick={() => {
                              setUpdateQuote((prev) => ({
                                ...prev,
                                assignedToUserId: employee.user.id,
                              }));
                              setAssignedUserName(employee.user.fullName);
                              setIsAssignUserOpen(false);
                            }}
                            className='px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer'
                          >
                            <div className='rounded-full bg-gray-400 w-9 h-9 flex items-center justify-center'>
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
                        <div className='flex flex-col items-center p-6 text-gray-500'>
                          <User2 className='w-8 h-8 mb-2' />
                          <p className='text-sm font-medium'>No users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='space-y-6'>
              <h3 className='font-semibold text-xl text-text-primary'>
                Line Items
              </h3>
              {updateQuote.lineItems.map((item, index) => (
                <div key={index} className='space-y-2'>
                  <div className='grid grid-cols-12 gap-4 items-center'>
                    <div className='col-span-6'>
                      <input
                        placeholder='Name'
                        value={item.name}
                        onChange={(e) =>
                          handleLineItemChange(index, 'name', e.target.value)
                        }
                        className='w-full p-2.5 text-sm border border-gray-300 rounded-lg'
                      />
                    </div>
                    <div className='col-span-2'>
                      <input
                        type='number'
                        min='1'
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className='w-full p-2.5 text-sm border border-gray-300 rounded-lg'
                      />
                    </div>
                    <div className='col-span-2'>
                      <input
                        type='number'
                        step='0.01'
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-full p-2.5 text-sm border border-gray-300 rounded-lg'
                      />
                    </div>
                    <div className='col-span-2 text-right font-semibold'>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(index, 'description', e.target.value)
                    }
                    className='w-full p-2.5 text-sm border border-gray-300 rounded-lg'
                    placeholder='Description (optional)'
                  />
                  {updateQuote.lineItems.length > 1 && (
                    <ButtonIcon
                      name='Remove'
                      customTextStyle='text-red-500'
                      handleBtnClick={() => removeLineItem(index)}
                    />
                  )}
                </div>
              ))}
              <IconButton
                icon={<Plus className='w-4 h-4 mr-2' />}
                onClick={addNewLineItem}
                customStyle='py-2 px-4 text-white bg-bg-primary'
              >
                Add Line Item
              </IconButton>
            </div>

            <div className='space-y-4 w-full flex flex-col items-end mt-8'>
              <div className='w-1/2 space-y-3'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Discount</span>
                  {isAddDiscount ? (
                    <div className='flex space-x-2 items-center'>
                      <button
                        onClick={() =>
                          setUpdateQuote((prev) => ({
                            ...prev,
                            discountType:
                              prev.discountType === DiscountType.Percentage
                                ? DiscountType.FixedAmount
                                : DiscountType.Percentage,
                          }))
                        }
                      >
                        {updateQuote.discountType ===
                        DiscountType.Percentage ? (
                          <Percent />
                        ) : (
                          <DollarSign />
                        )}
                      </button>
                      <input
                        type='number'
                        name='discountValue'
                        value={updateQuote.discountValue}
                        onChange={handleChange}
                        className='border w-20 text-sm rounded p-1'
                      />
                      <button
                        onClick={() => {
                          setIsAddDiscount(false);
                          setUpdateQuote((prev) => ({
                            ...prev,
                            discountValue: 0,
                          }));
                        }}
                      >
                        <Trash2 className='text-red-500' />
                      </button>
                    </div>
                  ) : (
                    <button
                      className='text-bg-primary'
                      onClick={() => setIsAddDiscount(true)}
                    >
                      Add Discount
                    </button>
                  )}
                </div>
                <div className='flex justify-between'>
                  <span>Tax</span>
                  {isAddTax ? (
                    <div className='flex space-x-2 items-center'>
                      <Percent />
                      <input
                        type='number'
                        name='taxRate'
                        value={updateQuote.taxRate}
                        onChange={handleChange}
                        className='border w-20 text-sm rounded p-1'
                      />
                      <button
                        onClick={() => {
                          setIsAddTax(false);
                          setUpdateQuote((prev) => ({ ...prev, taxRate: 0 }));
                        }}
                      >
                        <Trash2 className='text-red-500' />
                      </button>
                    </div>
                  ) : (
                    <button
                      className='text-bg-primary'
                      onClick={() => setIsAddTax(true)}
                    >
                      Add Tax
                    </button>
                  )}
                </div>
                <div className='flex justify-between font-bold border-t pt-2'>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 bg-white px-8 py-4 border-t flex justify-end space-x-3'>
          <CustomButton onClick={onClose}>Cancel</CustomButton>
          <CustomButton
            onClick={() => setQuote(updateQuote)}
            customStyle='bg-bg-primary text-white'
          >
            Save Changes
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default EditQuoteModal;
