import { useState, useMemo, useEffect } from 'react';
import { TAddJob } from '../../../types/Job';
import { GetAllCustomers } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import { TProperty } from '../../../types/Property';
import { GetServiceItems } from '../../../services/ServiceItem';
import { TServiceItem } from '../../../types/ServiceItem';
import { TModalLineItem } from '../../../types/LineItem';
// import {
//   XMarkIcon,
//   CalendarIcon,
//   UserPlusIcon,
//   PlusIcon,
//   TrashIcon,
// } from '@heroicons/react/24/outline';

type Employee = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

interface INewJobModal {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (job: TAddJob) => void;
}

const NewJobModal = ({ isOpen, onClose, onCreate }: INewJobModal) => {
  const [activeSection, setActiveSection] = useState<
    'customer' | 'details' | 'schedule' | 'team' | 'items'
  >('customer');
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  const [newJob, setNewJob] = useState<TAddJob>({
    title: '',
    description: '',
    customerId: '',
    propertyId: '',
    jobType: 'one-time',
    repeats: '',
    lineItems: [],
    status: 'scheduled',
    priority: 'normal',
    startDate: '',
    startTime: '',
    arrivalWindowStart: '',
    arrivalWindowEnd: '',
    duration: 1,
    estimatedDurationMinutes: 30,
    timeZone: timeZone,
    assignedTeamMemberIds: [],
    paymentStatus: 'unpaid',
    sendInvoice: false,
    sendReminder: false,
    reminderDaysBefore: 0,
    createdBy: 'user',
  });

  // Mock data - replace with your API calls
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<TCustomer>();
  const [selectedProperty, setSelectedProperty] = useState<TProperty>();
  const [selectedLineItems, setSelectedLineItems] = useState<TModalLineItem[]>(
    []
  );

  const fetchCustomers = async () => {
    const response = await GetAllCustomers();
    if (response.status === 200) {
      setCustomers(response.data.payload);
    }
  };

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Mike Taylor', role: 'Technician' },
    { id: '2', name: 'Alex Chen', role: 'Technician' },
    { id: '3', name: 'Jamie Wilson', role: 'Plumber' },
  ]);

  const [pricebookItems, setPricebookItems] = useState<TServiceItem[]>([]);

  const fetchPricebookItems = async () => {
    const response = await GetServiceItems();
    if (response.status === 200) {
      setPricebookItems(response.data.payload);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showPricebookModal, setShowPricebookModal] = useState(false);

  // const filteredCustomers = useMemo(() => {
  //   return customers.filter(
  //     (customer) =>
  //       customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       customer.customerPhones[0]?.phoneNumber.includes(searchTerm) ||
  //       customer.email[0]?.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [customers, searchTerm]);

  const subtotal = useMemo(() => {
    return selectedLineItems.reduce(
      (sum, item) => sum + item.serviceItem.unitPrice * item.quantity,
      0
    );
  }, [newJob.lineItems]);

  const tax = useMemo(() => {
    return selectedLineItems.reduce(
      (sum, item) =>
        sum +
        item.serviceItem.unitPrice *
          item.quantity *
          (item.serviceItem.taxRate / 100),
      0
    );
  }, [newJob.lineItems]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // const handleCustomerSelect = (customer: TCustomer) => {
  //   setNewJob({
  //     ...newJob,
  //     // customer: customer,
  //     customerId: customer.customerId,
  //     // property: customer.properties[0],
  //     propertyId: customer.properties[0]?.id,
  //   });
  //   setActiveSection('details');
  // };

  const handlePropertySelect = (property: TProperty) => {
    setNewJob((prev) => ({ ...prev, property }));
  };

  const handleJobTypeChange = (type: 'one-time' | 'recurring') => {
    setNewJob((prev) => ({ ...prev, jobType: type }));
  };

  // const handleAddLineItem = (item: TAddServiceItem) => {
  //   setNewJob((prev) => ({
  //     ...prev,
  //     lineItems: [
  //       ...prev.lineItems,
  //       {
  //         /*serviceItem: item,*/ serviceItemId: item.serviceItemId,
  //         quantity: 1,
  //       },
  //     ],
  //   }));
  //   setShowPricebookModal(false);
  // };

  // const handleRemoveLineItem = (id: string) => {
  //   setNewJob((prev) => ({
  //     ...prev,
  //     lineItems: prev.lineItems.filter((item) => item.lineItemId !== id),
  //   }));
  // };

  // const handleQuantityChange = (id: string, quantity: number) => {
  //   setNewJob((prev) => ({
  //     ...prev,
  //     lineItems: prev.lineItems.map((item) =>
  //       item.lineItemId === id ? { ...item, quantity } : item
  //     ),
  //   }));
  // };

  // const handleEmployeeToggle = (employee: Employee) => {
  //   setJobDetails((prev) => {
  //     const isAssigned = prev.assignedEmployees.some(
  //       (e) => e.id === employee.id
  //     );
  //     return {
  //       ...prev,
  //       assignedEmployees: isAssigned
  //         ? prev.assignedEmployees.filter((e) => e.id !== employee.id)
  //         : [...prev.assignedEmployees, employee],
  //     };
  //   });
  // };

  const handleCreateJob = () => {
    onCreate(newJob);
    onClose();
  };

  useEffect(() => {
    fetchCustomers();
    fetchPricebookItems();
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-800'>Create New Job</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            {/* <XMarkIcon className='h-6 w-6' /> */}
          </button>
        </div>

        {/* Progress Steps */}
        <div className='border-b border-gray-200 px-6 py-3'>
          <div className='flex justify-between'>
            {['customer', 'details', 'schedule', 'team', 'items'].map(
              (step) => (
                <button
                  key={step}
                  onClick={() => setActiveSection(step as any)}
                  className={`flex flex-col items-center ${
                    activeSection === step ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full mb-1 ${
                      activeSection === step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span className='text-xs font-medium capitalize'>{step}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeSection === 'customer' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  Select Customer
                </h3>
                <p className='text-sm text-gray-500'>
                  Search for an existing customer or add a new one
                </p>
              </div>

              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search customers by name, phone, or email'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center'
                >
                  {/* <UserPlusIcon className='h-4 w-4 mr-1' /> */}
                  New
                </button>
              </div>

              {customers.length > 0 ? (
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {customers.map((customer) => (
                    <div
                      key={customer.customerId}
                      onClick={() => {
                        setNewJob((prev) => ({
                          ...prev,
                          customerId: customer.customerId,
                          propertyId: customer.properties[0]?.id,
                        }));
                        setSelectedCustomers(customer);
                        setSelectedProperty(customer.properties[0]);
                        setActiveSection('details');
                      }}
                      className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                    >
                      <div className='flex justify-between'>
                        <h4 className='font-medium'>
                          {customer.firstName} {customer.lastName}
                        </h4>
                        <span className='text-sm text-gray-500'>
                          {customer.customerPhones[0]?.phoneNumber}
                        </span>
                      </div>
                      <p className='text-sm text-gray-500'>
                        {customer.email[0]}
                      </p>
                      <div className='mt-2 text-xs text-gray-400'>
                        {customer.properties.length}{' '}
                        {customer.properties.length === 1
                          ? 'property'
                          : 'properties'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  No customers found. Try a different search or create a new
                  customer.
                </div>
              )}
            </div>
          )}

          {activeSection === 'details' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  Job Details
                </h3>
                <p className='text-sm text-gray-500'>
                  Add title and description for this job
                </p>
              </div>

              {selectedCustomers ? (
                <>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-medium'>
                      {selectedCustomers?.firstName}{' '}
                      {selectedCustomers?.lastName}
                    </h4>
                    <div className='grid grid-cols-2 gap-4 mt-2'>
                      <div>
                        <p className='text-sm text-gray-700'>
                          {selectedCustomers?.customerPhones[0]?.phoneNumber}
                        </p>
                        <p className='text-sm text-gray-700'>
                          {selectedCustomers?.email[0]}
                        </p>
                      </div>
                      <div>
                        <select
                          value={selectedProperty?.id || ''}
                          onChange={(e) => {
                            const property = selectedCustomers?.properties.find(
                              (p) => p.id === e.target.value
                            );
                            if (property) handlePropertySelect(property);
                          }}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                        >
                          {selectedCustomers?.properties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.street}, {property.city},{' '}
                              {property.state} {property.postalCode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Job Title
                      </label>
                      <input
                        type='text'
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md'
                        placeholder='Enter job title'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Description
                      </label>
                      <textarea
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md'
                        rows={3}
                        placeholder='Enter job description'
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
                  Please select a customer first to add job details
                </div>
              )}
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>Schedule</h3>
                <p className='text-sm text-gray-500'>
                  Select job type and scheduling options
                </p>
              </div>

              <div className='flex space-x-4 mb-4'>
                <label className='inline-flex items-center'>
                  <input
                    type='radio'
                    className='h-4 w-4 text-blue-600'
                    checked={newJob.jobType === 'one-time'}
                    onChange={() => handleJobTypeChange('one-time')}
                  />
                  <span className='ml-2 text-gray-700'>One-Time</span>
                </label>
                <label className='inline-flex items-center'>
                  <input
                    type='radio'
                    className='h-4 w-4 text-blue-600'
                    checked={newJob.jobType === 'recurring'}
                    onChange={() => handleJobTypeChange('recurring')}
                  />
                  <span className='ml-2 text-gray-700'>Recurring</span>
                </label>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='md:col-span-2'>
                  <div className='bg-white p-4 rounded-lg border border-gray-200'>
                    <div className='flex justify-between items-center mb-4'>
                      <h4 className='font-medium'>June 2023</h4>
                      <div className='flex space-x-2'>
                        <button className='p-1 rounded-md hover:bg-gray-100'>
                          &lt;
                        </button>
                        <button className='p-1 rounded-md hover:bg-gray-100'>
                          &gt;
                        </button>
                      </div>
                    </div>
                    <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500'>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index}>{day}</div>
                      ))}
                    </div>
                    <div className='grid grid-cols-7 gap-1 mt-1'>
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-10 flex items-center justify-center text-sm rounded-md ${
                            i === 15
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : i >= 5 && i <= 19
                              ? 'hover:bg-gray-100 cursor-pointer'
                              : 'text-gray-300'
                          }`}
                        >
                          {i - 4}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Priority
                    </label>
                    <select
                      value={newJob.priority}
                      onChange={(e) =>
                        setNewJob((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                    >
                      <option value='low'>Low</option>
                      <option value='normal'>Normal</option>
                      <option value='high'>High</option>
                      <option value='urgent'>Urgent</option>
                    </select>
                  </div>

                  {newJob.jobType === 'one-time' ? (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Date
                        </label>
                        <div className='relative'>
                          <input
                            type='date'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                            onChange={(e) =>
                              setNewJob((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                          />
                          {/* <CalendarIcon className='h-5 w-5 text-gray-400 absolute right-3 top-2.5' /> */}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Start Time
                        </label>
                        <input
                          type='time'
                          value={newJob.startTime}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                        {/* <select className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i === 0
                                ? '12:00 AM'
                                : i < 12
                                ? `${i}:00 AM`
                                : i === 12
                                ? '12:00 PM'
                                : `${i - 12}:00 PM`}
                            </option>
                          ))}
                        </select> */}
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Arrival Window
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                          <input
                            type='time'
                            value={newJob.arrivalWindowStart}
                            onChange={(e) =>
                              setNewJob((prev) => ({
                                ...prev,
                                arrivalWindowStart: e.target.value,
                              }))
                            }
                          />
                          <input
                            type='time'
                            value={newJob.arrivalWindowEnd}
                            onChange={(e) =>
                              setNewJob((prev) => ({
                                ...prev,
                                arrivalWindowEnd: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Estimated Duration
                        </label>
                        <select
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              duration: parseInt(e.target.value),
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                          <option value={180}>3 hours</option>
                          <option value={240}>4 hours</option>
                          <option value={480}>Full day</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Start Date
                        </label>
                        <div className='relative'>
                          <input
                            type='date'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                            onChange={(e) =>
                              setNewJob((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                          />
                          {/* <CalendarIcon className='h-5 w-5 text-gray-400 absolute right-3 top-2.5' /> */}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Repeats
                        </label>
                        <select
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              repeats: e.target.value,
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                        >
                          <option value='weekly'>Weekly</option>
                          <option value='bi-weekly'>Bi-weekly</option>
                          <option value='monthly'>Monthly</option>
                          <option value='custom'>Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Arrival Time
                        </label>
                        <input
                          type='time'
                          value={newJob.startTime}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                        {/* <select className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i === 0
                                ? '12:00 AM'
                                : i < 12
                                ? `${i}:00 AM`
                                : i === 12
                                ? '12:00 PM'
                                : `${i - 12}:00 PM`}
                            </option>
                          ))}
                        </select> */}
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Duration (Months)
                        </label>
                        <input
                          type='number'
                          value={newJob.duration}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              duration: e.target.value,
                            }))
                          }
                          min='1'
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                          placeholder='e.g. 6 for 6 months'
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  Assign Team
                </h3>
                <p className='text-sm text-gray-500'>
                  Select technicians for this job
                </p>
              </div>

              <div className='space-y-4'>
                {newJob.assignedTeamMemberIds.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {/* {jobDetails.assignedEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className='flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                      >
                        {employee.name}
                        <button
                          onClick={() => handleEmployeeToggle(employee)}
                          className='ml-2 text-blue-600 hover:text-blue-800'
                        > */}
                    {/* <XMarkIcon className='h-4 w-4' /> */}
                    {/* </button>
                      </div>
                    ))} */}
                  </div>
                )}

                <div className='space-y-2'>
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      // onClick={() => handleEmployeeToggle(employee)}
                      className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between 
                        `}
                      //   ${
                      //   jobDetails.assignedEmployees.some(
                      //     (e) => e.id === employee.id
                      //   )
                      //     ? 'border-blue-500 bg-blue-50'
                      //     : 'border-gray-200 hover:bg-gray-50'
                      // }
                    >
                      <div className='flex items-center'>
                        <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3'>
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className='font-medium'>{employee.name}</h4>
                          <p className='text-sm text-gray-500'>
                            {employee.role}
                          </p>
                        </div>
                      </div>
                      <input
                        type='checkbox'
                        // checked={jobDetails.assignedEmployees.some(
                        //   (e) => e.id === employee.id
                        // )}
                        onChange={() => {}}
                        className='h-4 w-4 text-blue-600'
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'items' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  Line Items
                </h3>
                <p className='text-sm text-gray-500'>
                  Add services or products for this job
                </p>
              </div>

              <div className='flex space-x-3'>
                <button
                  onClick={() => setShowPricebookModal(true)}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center'
                >
                  {/* <PlusIcon className='h-4 w-4 mr-1' /> */}
                  Add from Pricebook
                </button>
                <button
                  // onClick={() =>
                  //   handleAddLineItem({
                  //     name: '',
                  //     description: '',
                  //     unitPrice: 0,
                  //   })
                  // }
                  className='bg-white text-blue-600 px-4 py-2 border border-blue-600 rounded-md text-sm flex items-center'
                >
                  {/* <PlusIcon className='h-4 w-4 mr-1' /> */}
                  Add Custom Item
                </button>
              </div>

              {selectedLineItems.length > 0 ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <div className='col-span-5'>Item</div>
                    <div className='col-span-2 text-right'>Qty</div>
                    <div className='col-span-3 text-right'>Price</div>
                    <div className='col-span-2 text-right'>Total</div>
                  </div>

                  {selectedLineItems.map((item) => (
                    <div
                      key={item.serviceItemId}
                      className='grid grid-cols-12 gap-4 items-center border-b border-gray-200 pb-3'
                    >
                      <div className='col-span-5'>
                        <input
                          type='text'
                          value={item.serviceItem?.name}
                          // onChange={(e) => {
                          //   setNewJob((prev) => ({
                          //     ...prev,
                          //     lineItems: prev.lineItems.map((i) =>
                          //       i.lineItemId === item.lineItemId
                          //         ? { ...i, name: e.target.value }
                          //         : i
                          //     ),
                          //   }));
                          // }}
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                        {/* {item.isCustom && (
                          <input
                            type='text'
                            placeholder='Description'
                            value={item.description || ''}
                            onChange={(e) => {
                              setJobDetails((prev) => ({
                                ...prev,
                                lineItems: prev.lineItems.map((i) =>
                                  i.id === item.id
                                    ? { ...i, description: e.target.value }
                                    : i
                                ),
                              }));
                            }}
                            className='w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        )} */}
                      </div>
                      <div className='col-span-2'>
                        <input
                          type='number'
                          min='1'
                          value={item.quantity}
                          // onChange={(e) =>
                          //   handleQuantityChange(
                          //     item.lineItemId,
                          //     parseInt(e.target.value) || 1
                          //   )
                          // }
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm text-right'
                        />
                      </div>
                      <div className='col-span-3 text-right'>
                        <input
                          type='number'
                          step='0.01'
                          min='0'
                          value={item.serviceItem?.unitPrice.toFixed(2)}
                          // onChange={(e) => {
                          //   setNewJob((prev) => ({
                          //     ...prev,
                          //     lineItems: prev.lineItems.map((i) =>
                          //       i.lineItemId === item.lineItemId
                          //         ? {
                          //             ...i,
                          //             price: parseFloat(e.target.value) || 0,
                          //           }
                          //         : i
                          //     ),
                          //   }));
                          // }}
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm text-right'
                        />
                      </div>
                      <div className='col-span-2 flex justify-between items-center'>
                        <span className='font-medium'>
                          $
                          {(
                            item.serviceItem?.unitPrice * item.quantity
                          ).toFixed(2)}
                        </span>
                        <button
                          // onClick={() => handleRemoveLineItem(item.lineItemId)}
                          className='text-red-500 hover:text-red-700'
                        >
                          {/* <TrashIcon className='h-4 w-4' /> */}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className='mt-6 space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='font-medium'>
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>
                        Tax (
                        {selectedLineItems[0]?.serviceItem?.taxRate
                          ? selectedLineItems[0]?.serviceItem?.taxRate
                          : 0}
                        %)
                      </span>
                      <span className='font-medium'>${tax.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between pt-2 border-t border-gray-200'>
                      <span className='text-gray-900 font-medium'>Total</span>
                      <span className='text-lg font-bold'>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className='mt-6 space-y-4'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='sendInvoice'
                        checked={newJob.sendInvoice}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            sendInvoice: e.target.checked,
                          }))
                        }
                        className='h-4 w-4 text-blue-600'
                      />
                      <label
                        htmlFor='sendInvoice'
                        className='ml-2 text-sm text-gray-700'
                      >
                        Send invoice after job completion
                      </label>
                    </div>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='sendReminder'
                        checked={newJob.sendReminder}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            sendReminder: e.target.checked,
                          }))
                        }
                        className='h-4 w-4 text-blue-600'
                      />
                      <label
                        htmlFor='sendReminder'
                        className='ml-2 text-sm text-gray-700'
                      >
                        Send reminder before job
                      </label>
                    </div>
                    {newJob.sendReminder && (
                      <div className='ml-6 flex items-center'>
                        <span className='text-sm text-gray-700 mr-2'>
                          Remind
                        </span>
                        <input
                          type='number'
                          min='1'
                          max='7'
                          value={newJob.reminderDaysBefore}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              reminderDays: parseInt(e.target.value) || 1,
                            }))
                          }
                          className='w-16 px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                        <span className='text-sm text-gray-700 ml-2'>
                          day(s) before
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
                  No line items added yet. Add services or products from your
                  pricebook or create custom items.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with sticky actions */}
        <div className='border-t border-gray-200 bg-white sticky bottom-0 p-4'>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log(newJob);
              }}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Save Draft
            </button>
            <button
              onClick={handleCreateJob}
              disabled={
                // !newJob.customer ||
                // !newJob.property ||
                newJob.lineItems.length === 0
              }
              className={`px-6 py-2 rounded-md text-sm font-medium text-white ${
                // !newJob.customer ||
                // !newJob.property ||
                newJob.lineItems.length === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Create Job
            </button>
          </div>
        </div>
      </div>

      {/* Pricebook Modal */}
      {showPricebookModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col'>
            <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                Add from Pricebook
              </h3>
              <button
                onClick={() => setShowPricebookModal(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                {/* <XMarkIcon className='h-6 w-6' /> */}
              </button>
            </div>
            <div className='p-4'>
              <input
                type='text'
                placeholder='Search pricebook items'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-4'
              />
              <div className='space-y-2 max-h-[60vh] overflow-y-auto'>
                {pricebookItems.map((item) => (
                  <div
                    key={item.serviceItemId}
                    onClick={() => {
                      setNewJob((prev) => ({
                        ...prev,
                        lineItems: [
                          ...prev.lineItems,
                          { serviceItemId: item.serviceItemId, quantity: 1 },
                        ],
                      }));
                      setSelectedLineItems((prev) => [
                        ...prev,
                        {
                          serviceItemId: item.serviceItemId,
                          serviceItem: item,
                          quantity: 1,
                        },
                      ]);
                      setShowPricebookModal(false);
                    }}
                    className='p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                  >
                    <div className='flex justify-between'>
                      <h4 className='font-medium'>{item.name}</h4>
                      <span className='text-blue-600'>
                        ${item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className='text-sm text-gray-500 mt-1'>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col'>
            <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                New Customer
              </h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                {/* <XMarkIcon className='h-6 w-6' /> */}
              </button>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Full Name
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone
                </label>
                <input
                  type='tel'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Address
                </label>
                <input
                  type='text'
                  placeholder='Street'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md mb-2'
                />
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='text'
                    placeholder='City'
                    className='px-3 py-2 border border-gray-300 rounded-md'
                  />
                  <select className='px-3 py-2 border border-gray-300 rounded-md'>
                    <option>State</option>
                  </select>
                </div>
                <input
                  type='text'
                  placeholder='ZIP Code'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md mt-2'
                />
              </div>
            </div>
            <div className='border-t border-gray-200 px-6 py-4 flex justify-end space-x-3'>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add customer logic
                  setShowNewCustomerModal(false);
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NewJobModal;
