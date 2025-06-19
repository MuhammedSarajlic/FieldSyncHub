import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import { TCustomer, TCustomerTab } from '../../types/Customer';
import { ArchiveCustomer, GetCustomerById } from '../../services/Customer';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import CustomerNotes from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerNotes';
import CustomerTags from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerTags';
import CustomerAddPropertyModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerAddPropertyModal';
import { TAddProperty } from '../../types/Property';
import { CreateProperty } from '../../services/Property';
import CustomerArchiveModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerArchiveModal';
import {
  Briefcase,
  CalendarClock,
  ClipboardList,
  FileText,
  Receipt,
} from 'lucide-react';
import CustomerEmailModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerEmailModal';
import CustomerEditModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerEditModal';
import { GetJobsByCustomer } from '../../services/Job';
import { GetQuotesByCustomer } from '../../services/Quote';
import { GetInvoicesByCustomer } from '../../services/Invoice';
import { GetRequestsByCustomer } from '../../services/Request';
import EmptyTabTable from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/EmptyTabTable';
import { TJob } from '../../types/Job';
import { TInvoice } from '../../types/Invoice';
import { TQuote } from '../../types/Quote';
import CustomerDetailsQuoteItem from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerQuoteTab/CustomerDetailsQuoteItem';
import CustomerDetailsInvoiceItem from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerInvoiceTab/CustomerDetailsInvoiceItem';
import CustomerDetailsRequestItem from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerRequestTab/CustomerDetailsRequestItem';
import CustomerDetailsJobItem from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerJobTab/CustomerDetailsJobItem';
import { TRequest } from '../../types/Request';
import CustomerJobs from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerJobTab/CustomerJobs';
import CustomerRequests from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerRequestTab/CustomerRequests';
import CustomerQuotes from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerQuoteTab/CustomerQuotes';
import CustomerInvoices from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerInvoiceTab/CustomerInvoices';
import { PhoneType } from '../../constants/Enumeration/CustomerEnum/CustomerPhone';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('jobs');
  const [customer, setCustomer] = useState<TCustomer>();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const { customerId } = useParams();

  const customerStats = {
    totalQuotes: 5,
    totalJobs: 3,
    totalInvoiced: 2850,
    invoicesCount: 4,
    lastActivity: '2024-06-30',
  };

  const [tabs, setTabs] = useState<TCustomerTab[]>([
    {
      id: 'jobs',
      label: 'Jobs',
      count: 0,
      loaded: false,
      loading: false,
      items: [] as TJob[],
      icon: Briefcase,
    },
    {
      id: 'requests',
      label: 'Requests',
      count: 0,
      loaded: false,
      loading: false,
      items: [],
      icon: ClipboardList,
    },
    {
      id: 'quotes',
      label: 'Quotes',
      count: 0,
      loaded: false,
      loading: false,
      items: [] as TQuote[],
      icon: FileText,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      count: 0,
      loaded: false,
      loading: false,
      items: [] as TInvoice[],
      icon: Receipt,
    },
  ]);

  const fetchTabData = async () => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        loaded: false,
        loading: true,
      }))
    );
    const jobs = await GetJobsByCustomer(customerId as string);
    const quotes = await GetQuotesByCustomer(customerId as string);
    const invoices = await GetInvoicesByCustomer(customerId as string);
    const requests = await GetRequestsByCustomer(customerId as string);
    console.log('invoices', invoices);

    if (jobs.status === 200) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === 'jobs'
            ? {
                ...tab,
                loaded: true,
                loading: false,
                items: jobs.data.payload,
                count: jobs.data.payload.length,
              }
            : tab
        )
      );
    }
    if (requests.status === 200) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === 'requests'
            ? {
                ...tab,
                loaded: true,
                items: requests.data.payload,
                count: requests.data.payload.length,
              }
            : tab
        )
      );
    }
    if (quotes.status === 200) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === 'quotes'
            ? {
                ...tab,
                loaded: true,
                items: quotes.data.payload,
                count: quotes.data.payload.length,
              }
            : tab
        )
      );
    }
    if (invoices.status === 200) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === 'invoices'
            ? {
                ...tab,
                loaded: true,
                items: invoices.data.payload,
                count: invoices.data.payload.length,
              }
            : tab
        )
      );
    }
  };

  const fetchCustomer = async () => {
    const response = await GetCustomerById(customerId as string);
    if (response.data.success) {
      setCustomer(response.data.payload);
    }
  };

  const handleArchive = async () => {
    const response = await ArchiveCustomer(customerId as string);
    if (response.status === 200) {
      navigate('/customers');
    }
  };

  const handleAddProperty = async (propertyData: TAddProperty) => {
    if (!customer) return;
    const isFirstProperty = customer.properties.length === 0;
    const finalProperty = {
      ...propertyData,
      isBillingAddress: isFirstProperty,
      customerId: customer.id,
    };
    const response = await CreateProperty(finalProperty);
    if (response.status === 200) {
      await fetchCustomer();
      setIsAddPropertyModalOpen(false);
    }
  };

  useEffect(() => {
    fetchTabData();
    fetchCustomer();
  }, [customerId]);

  const getPhoneIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'Work':
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z'
              clipRule='evenodd'
            />
            <path d='M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z' />
          </svg>
        );
      case 'Home':
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
          </svg>
        );
      default:
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
          </svg>
        );
    }
  };

  const renderContent = () => {
    const activeTab = tabs.find((t) => t.id === selectedTab);
    const items = (activeTab?.items || []) as any[];

    switch (selectedTab) {
      case 'jobs':
        return (
          <div className='space-y-3'>
            <CustomerJobs jobs={items} tab={activeTab} />
          </div>
        );
      case 'requests':
        return (
          <div className='space-y-3'>
            <CustomerRequests requests={items} tab={activeTab} />
          </div>
        );
      case 'quotes':
        return (
          <div className='space-y-3'>
            <CustomerQuotes quotes={items} tab={activeTab} />
          </div>
        );
      case 'invoices':
        return (
          <div className='space-y-3'>
            <CustomerInvoices invoices={items} tab={activeTab} />
          </div>
        );
      default:
        return null;
    }
  };

  if (!customer) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 ml-64'>
          <Navbar customer={customer} />
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = customer.isCompany
    ? customer.companyName
    : `${customer.firstName} ${customer.lastName}`;

  return (
    <div className='flex bg-white min-h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar customer={customer} />

        <div className='px-6 pb-10'>
          {/* Header Section */}
          <div className='bg-whitep-6 mb-6'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600'>
                  {customer.isCompany ? (
                    <svg
                      className='w-10 h-10'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V5z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-10 h-10'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 mb-1'>
                    {displayName}
                  </h1>
                  {customer.isCompany && (
                    <p className='text-gray-600 font-medium'>
                      {customer.firstName} {customer.lastName}
                    </p>
                  )}
                  <p className='text-sm text-gray-500 mt-2'>
                    Customer since {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className='px-4 py-2 cursor-pointer bg-bg-primary text-white rounded-lg hover:bg-bg-primary-hover transition-colors flex items-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                    <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                  </svg>
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='px-4 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setIsArchiveModalOpen(true)}
                  className='px-4 py-2 border border-red-200 text-red-600 cursor-pointer rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4 3a2 2 0 100 4h12a2 2 0 100-4H4z'
                      clipRule='evenodd'
                    />
                    <path d='M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z' />
                  </svg>
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column - Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* 1. Total Quotes */}
                <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <FileText className='w-5 h-5 text-blue-600' />
                    </div>
                    <h3 className='text-sm font-medium text-gray-600'>
                      Total Quotes
                    </h3>
                  </div>
                  <p className='text-2xl font-bold text-gray-900 mb-1'>
                    {customerStats.totalQuotes}
                  </p>
                  <p className='text-sm text-gray-500'>Issued quotes</p>
                </div>

                {/* 2. Total Jobs */}
                <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Briefcase className='w-5 h-5 text-green-600' />
                    </div>
                    <h3 className='text-sm font-medium text-gray-600'>
                      Total Jobs
                    </h3>
                  </div>
                  <p className='text-2xl font-bold text-gray-900 mb-1'>
                    {customerStats.totalJobs}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Completed or active jobs
                  </p>
                </div>

                {/* 3. Invoices / Total Spent */}
                <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <Receipt className='w-5 h-5 text-purple-600' />
                    </div>
                    <h3 className='text-sm font-medium text-gray-600'>
                      Total Invoiced
                    </h3>
                  </div>
                  <p className='text-2xl font-bold text-gray-900 mb-1'>
                    ${customerStats.totalInvoiced.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-500'>
                    From {customerStats.invoicesCount} invoice
                    {customerStats.invoicesCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* 4. Last Activity */}
                <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='p-2 bg-yellow-100 rounded-lg'>
                      <CalendarClock className='w-5 h-5 text-yellow-600' />
                    </div>
                    <h3 className='text-sm font-medium text-gray-600'>
                      Last Activity
                    </h3>
                  </div>
                  <p className='text-2xl font-bold text-gray-900 mb-1'>
                    {formatDate(customerStats.lastActivity)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Most recent interaction
                  </p>
                </div>
              </div>

              {/* Tabs Section */}
              <div className='bg-white rounded-lg border border-gray-100 shadow-sm'>
                <div className='border-b border-gray-200'>
                  <nav className='flex space-x-6 px-6'>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                          selectedTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className='flex items-center'>
                          {tab.label}
                          <span className='ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600'>
                            {tab.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className=''>{renderContent()}</div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className='space-y-6'>
              {/* Contact Information */}
              <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Contact Information
                </h3>
                <div className='space-y-4'>
                  {customer.emails && customer.emails.length > 0 ? (
                    <div>
                      <div className='flex items-center space-x-3 mb-2'>
                        <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                          <svg
                            className='w-4 h-4 text-gray-600'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                            <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                          </svg>
                        </div>
                        <span className='text-gray-700 font-medium'>Email</span>
                      </div>
                      <div className='pl-11 space-y-1'>
                        {customer.emails.map((email, index) => (
                          <p key={index} className='text-gray-600 text-sm'>
                            {email}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className='text-gray-500 text-sm'>
                      No contact information provided
                    </p>
                  )}

                  {customer.customerPhones &&
                    customer.customerPhones.length > 0 && (
                      <div>
                        <div className='flex items-center space-x-3 mb-2'>
                          <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                            <svg
                              className='w-4 h-4 text-gray-600'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                            </svg>
                          </div>
                          <span className='text-gray-700 font-medium'>
                            Phone
                          </span>
                        </div>
                        <div className='pl-11 space-y-3'>
                          {customer.customerPhones.map((phone) => (
                            <div
                              key={phone.id}
                              className='flex items-start space-x-3'
                            >
                              <div className='w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mt-0.5'>
                                {getPhoneIcon(PhoneType[phone.phoneType])}
                              </div>
                              <div>
                                <p className='text-gray-600 text-sm'>
                                  {phone.phoneNumber}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  {phone.phoneType}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Tags */}
              <CustomerTags tags={customer.tags} customerId={customer.id} />

              {/* Properties */}
              <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Properties
                  </h3>
                  <button
                    onClick={() => setIsAddPropertyModalOpen(true)}
                    className='text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
                  >
                    + Add property
                  </button>
                </div>
                {customer.properties && customer.properties.length > 0 ? (
                  <div className='space-y-4'>
                    {customer.properties.map((property, index) => (
                      <div
                        key={index}
                        className='p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-xs hover:shadow-sm'
                      >
                        <div className='flex items-center justify-between pb-2'>
                          <h3 className='text-lg font-semibold text-gray-900 truncate max-w-[80%]'>
                            {property.street}
                          </h3>
                          {property.isBillingAddress && (
                            <div className='px-2.5 py-1 bg-blue-50 rounded-full flex items-center'>
                              <svg
                                className='w-3 h-3 text-blue-500 mr-1.5'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                  clipRule='evenodd'
                                />
                              </svg>
                              <span className='text-xs font-medium text-blue-700'>
                                Billing Address
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='space-y-1 text-sm text-gray-600'>
                          <p className='flex items-start'>
                            <svg
                              className='w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                            </svg>
                            {property.street}
                          </p>
                          <p className='pl-6'>{`${property.city}, ${property.state} ${property.postalCode}`}</p>
                          <p className='pl-6'>{property.country}</p>
                        </div>

                        <div className='mt-3 pt-3 border-t border-gray-100 flex space-x-3'>
                          <button className='text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'>
                            View Details
                          </button>
                          <button className='text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline'>
                            Directions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-8 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1'
                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                      />
                    </svg>
                    <p className='mt-2 text-sm text-gray-500'>
                      No properties listed for this customer
                    </p>
                    <button
                      onClick={() => setIsAddPropertyModalOpen(true)}
                      className='mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
                    >
                      Add Property
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <CustomerNotes notes={customer.notes} customerId={customer.id} />
            </div>
          </div>
        </div>
      </div>
      <CustomerEditModal
        customer={customer}
        onClose={() => setIsEditModalOpen(false)}
        isOpen={isEditModalOpen}
        fetchCustomer={fetchCustomer}
      />

      <CustomerEmailModal
        isOpen={isEmailModalOpen}
        customerEmail={customer.emails[0]}
        onClose={() => setIsEmailModalOpen(false)}
        // onSend={() => {}}
      />
      <CustomerArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchive}
        customerName={customer.displayName}
      />
      <CustomerAddPropertyModal
        existingProperties={customer.properties || []}
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSave={handleAddProperty}
      />
    </div>
  );
};

export default CustomerDetails;
