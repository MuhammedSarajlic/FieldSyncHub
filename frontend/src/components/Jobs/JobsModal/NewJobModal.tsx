import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Plus,
  Settings,
  Building2,
  Mail,
  Phone,
  Percent,
  DollarSign,
  ChevronDown,
  UserPlus,
  Home,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/FuntionHelpers/formatCurrency';
import { TAddJob } from '../../../types/Job';
import { GetAllCustomers } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import {
  GetServiceItems,
  GetServiceItemsByFilter,
} from '../../../services/ServiceItem';
import { TServiceItem } from '../../../types/ServiceItem';
import { useAuth } from '../../../context/AuthProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import { TAddLineItem } from '../../../types/LineItem';
import {
  JobPriority,
  JobStatus,
  JobType,
  PaymentStatus,
} from '../../../constants/Enumeration/JobEnum/JobEnum';
import { DiscountType } from '../../../constants/Enumeration/CommonEnum/DiscountEnum';
import { GetEmployeesByWorkspace } from '../../../services/Employee';
import { TEmployee } from '../../../types/Employee';
import { CreateJob } from '../../../services/Job';
import { getJobStatus } from '../../../utils/FuntionHelpers/JobUtils/getJobStatus';
import { getJobPriority } from '../../../utils/FuntionHelpers/JobUtils/getJobPriority';
import IconButton from '../../CustomElements/Buttons/IconButton';
import CustomButton from '../../CustomElements/Buttons/CustomButton';

interface INewJobModal {
  isOpen: boolean;
  onClose: () => void;
}

const NewJobModal = ({ isOpen, onClose }: INewJobModal) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [filteredServiceItems, setFilteredServiceItems] = useState<
    TServiceItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Ref for the service item search input to manage focus
  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [job, setJob] = useState<TAddJob>({
    workspaceId: '',
    title: '',
    description: '',
    customerId: '',
    propertyId: '',
    jobType: JobType.OneTime,
    repeats: 'weekly',
    lineItems: [
      {
        quantity: 1,
        name: '',
        unitPrice: 0,
        description: '',
        isOptional: false,
      },
    ],
    status: JobStatus.Scheduled,
    statusHistory: [],
    priority: JobPriority.Normal,
    startDate: '',
    startTime: '',
    arrivalWindow: 0,
    duration: 1,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    estimatedDurationMinutes: 60,
    assignedTeamMembers: [],
    paymentStatus: PaymentStatus.Unpaid,
    depositAmount: 0,
    discountType: DiscountType.Percentage,
    discountValue: 0,
    taxRate: 0,
    sendInvoice: false,
    sendReminder: false,
    reminderDaysBefore: 1,
    confirmationSent: false,
    reminderSent: false,
    invoiceSent: false,
    createdBy: '',
    source: '',
    tags: [],
    customerNotes: '',
    internalNotes: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const numericFields = [
      'status',
      'priority',
      'jobType',
      'paymentStatus',
      'discountType',
      'taxRate',
      'discountValue',
      'estimatedDurationMinutes',
      'depositAmount',
      'reminderDaysBefore',
      'duration',
    ];

    let parsedValue: any = value;

    if (type === 'checkbox') {
      parsedValue = checked;
    } else if (numericFields.includes(name)) {
      parsedValue = Number(value);
    }

    setJob((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleEmployeeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selectedIds = options
      .filter((option) => option.selected)
      .map((option) => option.value);

    setSelectedEmployeeIds(selectedIds);

    const selectedEmployeeObjects = employees.filter((emp) =>
      selectedIds.includes(emp.id)
    );

    setJob((prevJob) => ({
      ...prevJob,
      assignedTeamMembers: selectedEmployeeObjects,
    }));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!job.tags?.includes(newTag)) {
        setJob((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setJob((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const calculateJobTotals = (currentJob: TAddJob) => {
    const subtotal = currentJob.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount =
      currentJob.discountType === DiscountType.Percentage
        ? subtotal * (currentJob.discountValue / 100)
        : currentJob.discountValue;
    const taxAmount = (subtotal - discountAmount) * (currentJob.taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } =
    calculateJobTotals(job);

  const selectServiceItem = (
    currentJob: TAddJob,
    index: number,
    serviceItem: TServiceItem,
    setJob: React.Dispatch<React.SetStateAction<TAddJob>>,
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
    setActiveSearchIndex: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    setJob((prev) => {
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
    currentJob: TAddJob,
    index: number,
    field: keyof TAddLineItem,
    value: any,
    setJob: React.Dispatch<React.SetStateAction<TAddJob>>
  ) => {
    setJob((prev) => {
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
    currentJob: TAddJob,
    setJob: React.Dispatch<React.SetStateAction<TAddJob>>
  ) => {
    setJob((prev) => ({
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
    currentJob: TAddJob,
    index: number,
    setJob: React.Dispatch<React.SetStateAction<TAddJob>>
  ) => {
    if (currentJob.lineItems.length > 1) {
      setJob((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setSelectedProperty(''); // Reset property selection
    setJob((prev) => ({
      ...prev,
      customerId: customerId,
      propertyId: '', // Reset property ID
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
    setJob((prev) => ({
      ...prev,
      propertyId: propertyId,
    }));
  };

  const handleSubmit = async () => {
    if (!user?.workspace) {
      console.error('User or workspace not available.');
      return;
    }
    const combineDateTimeToISO = (
      dateStr: string,
      timeStr: string
    ): string | undefined => {
      if (!dateStr || !timeStr) {
        return undefined; // Return undefined if date or time is missing
      }
      // Construct a string in local format (e.g., "2023-10-27T10:30:00")
      const dateTimeLocalString = `${dateStr}T${timeStr}:00`;
      const combinedDateTime = new Date(dateTimeLocalString);

      // Check if the date is valid before converting
      if (isNaN(combinedDateTime.getTime())) {
        console.warn(
          `Invalid date/time combination: Date: ${dateStr}, Time: ${timeStr}`
        );
        return undefined;
      }
      return combinedDateTime.toISOString(); // Convert to UTC ISO string
    };

    job.startTime = combineDateTimeToISO(job.startDate, job.startTime);
    const updatedJob = {
      ...job,
      workspaceId: user.workspace.id,
      createdBy: user.id,
      taxRate: job.taxRate / 100,
    };
    console.log(updatedJob);

    try {
      const response = await CreateJob(updatedJob);
      if (response.status === 200) {
        onClose();
      } else {
        console.error(
          'Failed to create job:',
          response.data?.message ?? 'Unknown error'
        );
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await GetAllCustomers();
      if (response.status === 200) {
        setCustomers(response.data.payload);
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
    if (!user || !user.workspace) return;
    const result = await GetEmployeesByWorkspace(user.workspace.id);
    if (result.status === 200) {
      setEmployees(result.data.payload);
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
    fetchEmployees();
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
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-[75%] max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header - White background */}
        <div className='bg-white flex justify-between items-center px-8 py-6 border-b border-gray-200 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Create New Job</h2>
            <p className='text-gray-600 text-sm mt-1'>
              Schedule and manage service jobs for your customers
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
          <div className='flex-1 overflow-y-auto px-8 py-6 border-r border-gray-200'>
            <div className='space-y-10'>
              {/* Job Basic Information */}
              <div className=''>
                <div className='flex items-center space-x-3 mb-6'>
                  {/* <FileText className='w-5 h-5 text-[#356852]' /> */}
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Job Information
                  </h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label
                      htmlFor='job-title'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Job Title <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='job-title'
                      name='title'
                      value={job.title}
                      onChange={handleChange}
                      required
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                      placeholder='Enter job title...'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='source'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Source
                    </label>
                    <input
                      type='text'
                      id='source'
                      name='source'
                      value={job.source}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                      placeholder='How did this job come in?'
                    />
                  </div>
                </div>

                <div className='mt-6'>
                  <label
                    htmlFor='job-description'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Description
                  </label>
                  <textarea
                    id='job-description'
                    name='description'
                    value={job.description}
                    onChange={handleChange}
                    rows={3}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] resize-y text-sm'
                    placeholder='Describe the job details...'
                  />
                </div>
              </div>

              {/* Customer Section */}
              <div className=''>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center space-x-3'>
                    {/* <User className='w-5 h-5 text-[#356852]' /> */}
                    <h3 className='font-semibold text-xl text-text-primary'>
                      Customer & Property
                    </h3>
                  </div>
                  <button
                    type='button'
                    onClick={() => setShowAddCustomer(true)}
                    className='flex items-center px-4 py-2 bg-[#356852] text-white rounded-lg hover:bg-[#2d5a44] transition-colors font-medium text-sm shadow-md'
                  >
                    <UserPlus className='w-4 h-4 mr-2' />
                    Add Customer
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                    <div className='relative'>
                      <select
                        id='property-select'
                        value={selectedProperty}
                        onChange={handlePropertyChange}
                        required
                        disabled={!selectedCustomer}
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none disabled:bg-gray-100'
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

                {selectedCustomerData && (
                  <div className='mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm'>
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
                            <Home className='w-4 h-4 inline mr-1' />
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
                )}
              </div>

              {/* Job Details Section */}
              <div className=''>
                <div className='flex items-center space-x-3 mb-6'>
                  {/* <Calendar className='w-5 h-5 text-[#356852]' /> */}
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Job Details
                  </h3>
                </div>

                {/* Job Type & Priority */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  <div>
                    <label
                      htmlFor='job-type'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Job Type <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <select
                        id='job-type'
                        name='jobType'
                        value={job.jobType}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                      >
                        <option value={JobType.OneTime}>One Time</option>
                        <option value={JobType.Recurring}>Recurring</option>
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                        <ChevronDown className='w-5 h-5' />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='priority'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Priority
                    </label>
                    <div className='relative'>
                      <select
                        id='priority'
                        name='priority'
                        value={job.priority}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                      >
                        <option value={JobPriority.Low}>Low</option>
                        <option value={JobPriority.Normal}>Normal</option>
                        <option value={JobPriority.High}>High</option>
                        <option value={JobPriority.Urgent}>Urgent</option>
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                        <ChevronDown className='w-5 h-5' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling Details */}
                <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6'>
                  <div>
                    <label
                      htmlFor='start-date'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Start Date <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      id='start-date'
                      name='startDate'
                      value={job.startDate}
                      onChange={handleChange}
                      required
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='start-time'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Start Time <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='time'
                      id='start-time'
                      name='startTime'
                      value={job.startTime}
                      onChange={handleChange}
                      required
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='estimated-duration'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type='number'
                      id='estimated-duration'
                      name='estimatedDurationMinutes'
                      value={job.estimatedDurationMinutes}
                      onChange={handleChange}
                      min='1'
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                      placeholder='e.g., 60 for 1 hour'
                    />
                  </div>

                  {/* Arrival Window */}
                  <div>
                    <label
                      htmlFor='arrivalWindow'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Arrival Window
                    </label>
                    <div className='relative'>
                      <select
                        id='arrivalWindow'
                        name='arrivalWindow'
                        value={job.arrivalWindow}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                      >
                        <option value=''>None</option>
                        <option value='15'>15 minutes</option>
                        <option value='30'>30 minutes</option>
                        <option value='60'>1 hour</option>
                        <option value='120'>2 hour</option>
                        <option value='180'>3 hour</option>
                        <option value='240'>4 hour</option>
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                        <ChevronDown className='w-5 h-5' />
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <label
                      htmlFor='arrival-window-end'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Arrival Window End
                    </label>
                    <input
                      type='time'
                      id='arrival-window-end'
                      name='arrivalWindowEnd'
                      value={job.arrivalWindowEnd}
                      onChange={handleChange}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                    />
                  </div> */}
                </div>

                {job.jobType === JobType.Recurring && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200'>
                    <div>
                      <label
                        htmlFor='repeats'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Repeats <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <select
                          id='repeats'
                          name='repeats'
                          value={job.repeats}
                          onChange={handleChange}
                          className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                        >
                          <option value='weekly'>Weekly</option>
                          <option value='biweekly'>Bi-weekly</option>
                          <option value='monthly'>Monthly</option>
                          <option value='quarterly'>Quarterly</option>
                          <option value='semiannually'>Semi-annually</option>
                          <option value='annually'>Annually</option>
                          <option value='custom'>Custom</option>
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='duration'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Number of Visits/Occurrences
                      </label>
                      <input
                        type='number'
                        id='duration'
                        name='duration'
                        value={job.duration}
                        onChange={handleChange}
                        min='1'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                        placeholder='e.g., 12 for 12 visits'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members Section */}
              <div className=''>
                <div className='flex items-center space-x-3 mb-6'>
                  {/* <Users className='w-5 h-5 text-[#356852]' /> */}
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Assigned Team Members
                  </h3>
                </div>
                <div className='relative'>
                  <select
                    id='assigned-team-members'
                    multiple
                    value={selectedEmployeeIds}
                    onChange={handleEmployeeSelection}
                    className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none h-32' // Added h-32 for better multi-select visibility
                  >
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.user.fullName}
                      </option>
                    ))}
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                    <ChevronDown className='w-5 h-5' />
                  </div>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  Hold Ctrl (Windows) or Command (Mac) to select multiple team
                  members.
                </p>
              </div>

              {/* Line Items Section - Always show at least one */}
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-3'>
                    {/* <FileText className='w-5 h-5 text-[#356852]' /> */}
                    <h3 className='font-semibold text-xl text-text-primary'>
                      Line items
                    </h3>
                  </div>
                </div>

                <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase pb-2 border-b border-gray-200'>
                  <div className='col-span-6'>Item name</div>
                  <div className='col-span-2'>Qty</div>
                  <div className='col-span-2'>Unit Price</div>
                  <div className='col-span-2 text-right'>Total</div>
                </div>

                <div className='space-y-6'>
                  {job.lineItems.map((item, index) => (
                    <div
                      key={item.serviceItemId || `new-item-${index}`}
                      className=''
                    >
                      <div className='grid grid-cols-12 gap-4 items-center'>
                        <div className='col-span-6 relative'>
                          <input
                            type='text'
                            value={item.name ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchTerm(value);
                              handleLineItemChange(
                                job,
                                index,
                                'name',
                                value,
                                setJob
                              );
                            }}
                            onFocus={() => setActiveSearchIndex(index)}
                            onBlur={() =>
                              setTimeout(() => setActiveSearchIndex(null), 200)
                            }
                            className='w-full p-2.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#356852] focus:border-[#356852] outline-none'
                            placeholder='Service name'
                            ref={(el) => (searchInputRefs.current[index] = el)}
                          />

                          {activeSearchIndex === index &&
                            filteredServiceItems.length > 0 && (
                              <div className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                {filteredServiceItems.map((service) => (
                                  <div
                                    key={service.id}
                                    className='px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer flex justify-between items-center'
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() =>
                                      selectServiceItem(
                                        job,
                                        index,
                                        service,
                                        setJob,
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
                                job,
                                index,
                                'quantity',
                                parseInt(e.target.value) || 1,
                                setJob
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#356852] focus:border-[#356852] outline-none'
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
                                job,
                                index,
                                'unitPrice',
                                parseFloat(e.target.value) || 0,
                                setJob
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#356852] focus:border-[#356852] outline-none'
                          />
                        </div>

                        <div className='col-span-2 text-right text-base font-semibold text-gray-900'>
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>

                      <div className='mt-3 grid grid-cols-12 gap-3 items-start'>
                        <div className='col-span-6'>
                          <textarea
                            rows={2}
                            value={item.description ?? ''}
                            onChange={(e) =>
                              handleLineItemChange(
                                job,
                                index,
                                'description',
                                e.target.value,
                                setJob
                              )
                            }
                            className='w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#356852] focus:border-[#356852] resize-y outline-none'
                            placeholder='Add a description for this service (optional)'
                          />
                        </div>

                        <div className='col-span-2'>
                          {job.lineItems.length > 1 && (
                            <CustomButton
                              onClick={() => removeLineItem(job, index, setJob)}
                              customStyle='text-red-600 py-2 px-4 hover:bg-gray-50 hover:border-gray-300'
                            >
                              Remove
                            </CustomButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex items-center space-x-3'>
                  <IconButton
                    icon={<Plus className='w-4 h-4 mr-2' />}
                    onClick={() => addNewLineItem(job, setJob)}
                    customStyle='py-2 px-4 text-white bg-bg-primary'
                  >
                    Add Line Item
                  </IconButton>
                </div>
              </div>

              {/* Pricing Summary and Discounts */}
              <div className=''>
                <div className='flex items-center space-x-3 mb-6'>
                  {/* <DollarSign className='w-5 h-5 text-[#356852]' /> */}
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Pricing & Payment
                  </h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  <div>
                    <label
                      htmlFor='payment-status'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Payment Status
                    </label>
                    <div className='relative'>
                      <select
                        id='payment-status'
                        name='paymentStatus'
                        value={job.paymentStatus}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                      >
                        <option value={PaymentStatus.Unpaid}>Unpaid</option>
                        <option value={PaymentStatus.Partial}>
                          Partially Paid
                        </option>
                        <option value={PaymentStatus.Paid}>Paid</option>
                        <option value={PaymentStatus.Refunded}>Refunded</option>
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                        <ChevronDown className='w-5 h-5' />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='deposit-amount'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Deposit Amount
                    </label>
                    <input
                      type='number'
                      id='deposit-amount'
                      name='depositAmount'
                      value={job.depositAmount}
                      onChange={handleChange}
                      min='0'
                      step='0.01'
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                      placeholder='e.g., 50.00'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Discount Type and Value */}
                  <div>
                    <label
                      htmlFor='discount'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Discount
                    </label>
                    <div className='flex items-center gap-2'>
                      <div className='relative flex-1 min-w-[60px]'>
                        {' '}
                        {/* Added min-w to the parent flex-1 div */}
                        <select
                          id='discount-type'
                          name='discountType'
                          value={job.discountType}
                          onChange={handleChange}
                          // Removed pr-3 from here, let absolute positioned chevron handle right spacing
                          className='w-full border border-gray-300 rounded-lg pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm appearance-none'
                        >
                          <option value={DiscountType.Percentage}>%</option>
                          <option value={DiscountType.FixedAmount}>
                            $
                          </option>{' '}
                          {/* Confirmed FixedAmount */}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700'>
                          <ChevronDown className='w-5 h-5' />
                        </div>
                      </div>
                      <div className='relative w-full'>
                        <input
                          type='number'
                          id='discount-value'
                          name='discountValue'
                          value={job.discountValue}
                          onChange={handleChange}
                          min='0'
                          step='0.01'
                          className='w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                          placeholder={
                            job.discountType === DiscountType.Percentage
                              ? 'e.g., 10'
                              : 'e.g., 25.00'
                          }
                        />
                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                          {job.discountType === DiscountType.Percentage ? (
                            <Percent className='w-4 h-4' />
                          ) : (
                            <DollarSign className='w-4 h-4' />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='tax-rate'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Tax Rate (%)
                    </label>
                    <input
                      type='number'
                      id='tax-rate'
                      name='taxRate'
                      value={job.taxRate}
                      onChange={handleChange}
                      min='0'
                      max='100'
                      step='0.01'
                      className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                      placeholder='e.g., 8.25'
                    />
                  </div>
                </div>

                <div className='w-full flex justify-end mt-8 pt-6 border-t border-gray-200'>
                  <div className='w-1/2 space-y-3'>
                    <div className='flex justify-between items-center text-sm text-gray-700'>
                      <span>Subtotal:</span>
                      <span className='font-medium'>
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm text-gray-700'>
                      <span>Discount:</span>
                      <span className='font-medium text-bg-primary'>
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm text-gray-700'>
                      <span>Tax ({job.taxRate}%):</span>
                      <span className='font-medium'>
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between border-t border-gray-200 items-center text-lg font-bold text-gray-900 pt-2'>
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Settings */}
              <div className=''>
                <div className='flex items-center space-x-3 mb-6'>
                  {/* <Bell className='w-5 h-5 text-[#356852]' /> */}
                  <h3 className='font-semibold text-xl text-text-primary'>
                    Communication & Notes
                  </h3>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='send-invoice'
                      name='sendInvoice'
                      checked={job.sendInvoice}
                      onChange={handleChange}
                      className='form-checkbox h-4 w-4 text-[#356852] rounded focus:ring-[#356852]'
                    />
                    <label
                      htmlFor='send-invoice'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Send Invoice
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='send-reminder'
                      name='sendReminder'
                      checked={job.sendReminder}
                      onChange={handleChange}
                      className='form-checkbox h-4 w-4 text-[#356852] rounded focus:ring-[#356852]'
                    />
                    <label
                      htmlFor='send-reminder'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Send Reminder
                    </label>
                  </div>

                  {job.sendReminder && (
                    <div className='ml-6'>
                      <label
                        htmlFor='reminder-days-before'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Reminder Days Before
                      </label>
                      <input
                        type='number'
                        id='reminder-days-before'
                        name='reminderDaysBefore'
                        value={job.reminderDaysBefore}
                        onChange={handleChange}
                        min='0'
                        className='w-full max-w-[150px] border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                        placeholder='e.g., 1'
                      />
                    </div>
                  )}
                </div>

                <div className='mt-6'>
                  <label
                    htmlFor='customer-notes'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Customer Notes
                  </label>
                  <textarea
                    id='customer-notes'
                    name='customerNotes'
                    value={job.customerNotes}
                    onChange={handleChange}
                    rows={3}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] resize-y text-sm'
                    placeholder='Notes visible to the customer...'
                  />
                </div>

                <div className='mt-6'>
                  <label
                    htmlFor='internal-notes'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Internal Notes
                  </label>
                  <textarea
                    id='internal-notes'
                    name='internalNotes'
                    value={job.internalNotes}
                    onChange={handleChange}
                    rows={3}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] resize-y text-sm'
                    placeholder='Private notes for your team...'
                  />
                </div>

                <div className='mt-6'>
                  <label
                    htmlFor='tags'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Tags
                  </label>
                  {job.tags && job.tags.length > 0 && (
                    <div className='flex flex-wrap items-center gap-2 mb-2'>
                      {job.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className='flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium'
                        >
                          {tag}
                          <button
                            type='button'
                            onClick={() => removeTag(tag)}
                            className='ml-2 text-gray-500 hover:text-gray-700'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type='text'
                    id='tags'
                    name='tagInput'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                    placeholder='Add tags (press Enter to add)'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Job Summary */}
          <div className='lg:w-2/5 bg-gray-50 p-6 overflow-y-auto border-l border-gray-200'>
            <div className='sticky top-0 space-y-6'>
              <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                <h3 className='font-semibold text-lg text-gray-900 mb-4 flex items-center'>
                  <Settings className='w-5 h-5 mr-2 text-[#356852]' />
                  Job Summary
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Customer:
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {selectedCustomerData?.fullName || 'Not selected'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Property:
                    </span>
                    <span className='text-sm font-semibold text-gray-900 text-right break-words max-w-[60%]'>
                      {selectedPropertyData?.address || 'Not selected'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Job Type:
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {job.jobType === JobType.OneTime
                        ? 'One Time'
                        : 'Recurring'}
                    </span>
                  </div>
                  {job.jobType === JobType.Recurring && (
                    <>
                      <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                        <span className='text-sm font-medium text-gray-600'>
                          Repeats:
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>
                          {job.repeats}
                        </span>
                      </div>
                      <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                        <span className='text-sm font-medium text-gray-600'>
                          Number of Visits:
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>
                          {job.duration}
                        </span>
                      </div>
                    </>
                  )}
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Priority:
                    </span>
                    <span
                      className={`font-semibold px-2 py-1 rounded-full text-xs ${getJobPriority(
                        job.priority
                      )}`}
                    >
                      {JobPriority[job.priority]}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Status:
                    </span>
                    <span
                      className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        getJobStatus(job.status).color
                      }`}
                    >
                      {JobStatus[job.status]}
                    </span>
                  </div>
                  {job.startDate && ( // Using startDate as scheduledDate
                    <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                      <span className='text-sm font-medium text-gray-600'>
                        Scheduled:
                      </span>
                      <span className='text-sm font-semibold text-gray-900'>
                        {new Date(job.startDate).toLocaleDateString()}
                        {job.startTime && ` at ${job.startTime}`}
                      </span>
                    </div>
                  )}
                  {job.arrivalWindowStart && job.arrivalWindowEnd && (
                    <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                      <span className='text-sm font-medium text-gray-600'>
                        Arrival Window:
                      </span>
                      <span className='text-sm font-semibold text-gray-900'>
                        {job.arrivalWindowStart} - {job.arrivalWindowEnd}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Estimated Duration:
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {job.estimatedDurationMinutes} minutes
                    </span>
                  </div>
                  <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                    <span className='text-sm font-medium text-gray-600'>
                      Assigned To:
                    </span>
                    <div className='text-sm font-semibold text-gray-900 text-right'>
                      {job.assignedTeamMembers.length > 0
                        ? job.assignedTeamMembers
                            .map((employee) => employee.user.fullName)
                            .join(', ')
                        : 'Not assigned'}
                    </div>
                  </div>
                  <div className='pt-4 bg-gray-50 rounded-lg p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-[#356852]'>
                        {formatCurrency(total)}
                      </div>
                      <div className='text-sm text-gray-600'>Total Amount</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className='sticky bottom-0 bg-white z-10 px-8 py-4 border-t border-gray-100'>
          <div className='flex items-center justify-end space-x-3'>
            <CustomButton
              onClick={onClose}
              customStyle='px-5 py-2.5 shadow-sm border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleSubmit}
              customStyle='px-5 py-2.5 bg-bg-primary text-white hover:bg-bg-primary-hover'
            >
              Create Job
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewJobModal;
