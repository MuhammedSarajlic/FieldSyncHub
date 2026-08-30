import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Mail, Pencil, Archive } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/CustomElements/Button';
import {
  TCustomer,
  TCustomerDetailsStats,
  TCustomerTab,
} from '../../types/Customer';
import { ArchiveCustomer, GetCustomerById } from '../../services/Customer';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import CustomerNotes from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerNotes';
import CustomerTags from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerTags';
import CustomerAddPropertyModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerProperties/Modals/CustomerAddPropertyModal';
import { TAddProperty, TProperty } from '../../types/Property';
import { CreateProperty, UpdateProperty } from '../../services/Property';
import CustomerArchiveModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerArchiveModal';
import CustomerEmailModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerEmailModal';
import CustomerEditModal from '../../components/Customers/EditCustomerModal/CustomerEditModal';
import { GetJobsByCustomer } from '../../services/Job';
import { GetQuotesByCustomer } from '../../services/Quote';
import { GetInvoicesByCustomer } from '../../services/Invoice';
import { GetLeadsByCustomer } from '../../services/Lead';
import { TJob } from '../../types/Job';
import { TInvoice } from '../../types/Invoice';
import { TQuote } from '../../types/Quote';

import JobTabTableList from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerJobTab/JobTabTableList';
import LeadTabTableList from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/LeadTab/LeadTabTableList';
import QuoteTabTableList from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerQuoteTab/QuoteTabTableList';
import InvoiceTabTableList from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/InvoiceTab/InvoiceTabTableList';
import CustomerInformation from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerInformation';
import CustomerPropertyList from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerProperties/CustomerPropertyList';
import CustomerEditPropertyModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerProperties/Modals/CustomerEditPropertyModal';
import PageLoader from '../../components/CustomElements/Loaders/PageLoader';
import { TLead, TRequest } from '../../types/Lead';
import CustomerStatCards from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerStatCards/CustomerStatCards';
import {
  customerStatsInitialState,
  customerTabsInitialState,
} from '../../constants/States/CustomerDetails/customerDetailsStates';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [selectedTab, setSelectedTab] = useState('jobs');
  const [customer, setCustomer] = useState<TCustomer>();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<TProperty | null>(null);

  const [customerStats, setCustomerStats] = useState<TCustomerDetailsStats>(
    customerStatsInitialState
  );
  const [tabs, setTabs] = useState<TCustomerTab[]>(customerTabsInitialState);

  const fetchTabData = async (selectedTab: string) => {
    if (!customerId) return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === selectedTab
          ? {
              ...tab,
              loaded: false,
              loading: true,
            }
          : tab
      )
    );

    let dataToUpdate = {};
    let jobs;
    let leads;
    let quotes;
    let invoices;

    switch (selectedTab) {
      case 'jobs':
        jobs = await GetJobsByCustomer(customerId);
        if (jobs.status === 200) {
          dataToUpdate = {
            items: jobs.data.payload,
          };
        }
        break;
      case 'leads':
        leads = await GetLeadsByCustomer(customerId);
        if (leads.status === 200) {
          dataToUpdate = {
            items: leads.data.payload,
          };
        }
        break;
      case 'quotes':
        quotes = await GetQuotesByCustomer(customerId);
        if (quotes.status === 200) {
          dataToUpdate = {
            items: quotes.data.payload,
          };
        }
        break;
      case 'invoices':
        invoices = await GetInvoicesByCustomer(customerId);
        if (invoices.status === 200) {
          dataToUpdate = {
            items: invoices.data.payload,
          };
        }
        break;
      default:
        console.warn(`Unknown tab selected: ${selectedTab}`);
        return;
    }

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === selectedTab
          ? {
              ...tab,
              loaded: true,
              loading: false,
              ...dataToUpdate,
            }
          : tab
      )
    );
  };

  const fetchCustomer = async () => {
    const response = await GetCustomerById(customerId as string);
    if (response.data.success) {
      const { item, totalInvoiceValue, counts } = response.data.payload;
      setCustomer(item);
      setCustomerStats((prev) => ({
        ...prev,
        totalJobs: counts.jobs,
        totalQuotes: counts.quotes,
        invoicesCount: counts.invoices,
        totalInvoiced: totalInvoiceValue,
        lastActivity: item.lastActivity,
      }));
      setTabs((prev) =>
        prev.map((tab) => {
          switch (tab.id) {
            case 'jobs':
              return { ...tab, count: counts.jobs };
            case 'leads':
              return { ...tab, count: counts.leads };
            case 'quotes':
              return { ...tab, count: counts.quotes };
            case 'invoices':
              return { ...tab, count: counts.invoices };
            default:
              return tab;
          }
        })
      );
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

  const handleEditProperty = (property: TProperty) => {
    setPropertyToEdit(property);
    setIsEditPropertyModalOpen(true);
  };

  const renderCustomerTabContent = () => {
    const activeTab = tabs.find((t) => t.id === selectedTab);

    if (!activeTab) {
      return null;
    }

    switch (selectedTab) {
      case 'jobs':
        return (
          <JobTabTableList jobs={activeTab.items as TJob[]} tab={activeTab} />
        );
      case 'leads':
        return (
          <LeadTabTableList
            leads={activeTab.items as TLead[]}
            tab={activeTab}
          />
        );
      case 'quotes':
        return (
          <QuoteTabTableList
            quotes={activeTab.items as TQuote[]}
            tab={activeTab}
          />
        );
      case 'invoices':
        return (
          <InvoiceTabTableList
            invoices={activeTab.items as TInvoice[]}
            tab={activeTab}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchTabData(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (!customer) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 md:ml-64'>
          <Navbar customer={customer} />
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className='flex bg-white min-h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
        <Navbar customer={customer} />

        <div className='px-6 pt-6 pb-10'>
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
                    {customer.displayName}
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
                <Button
                  variant='primary'
                  onClick={() => setIsEmailModalOpen(true)}
                  leftIcon={<Mail className='w-4 h-4' />}
                >
                  Email
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => setIsEditModalOpen(true)}
                  leftIcon={<Pencil className='w-4 h-4' />}
                >
                  Edit
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsArchiveModalOpen(true)}
                  customStyle='text-red-600 border-red-200 hover:bg-red-50'
                  leftIcon={<Archive className='w-4 h-4' />}
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column - Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Stats Cards */}
              <CustomerStatCards customerStats={customerStats} />

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

                <div>{renderCustomerTabContent()}</div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className='space-y-6'>
              {/* Contact Information */}
              <CustomerInformation customer={customer} />

              {/* Tags */}
              <CustomerTags tags={customer.tags} customerId={customer.id} />

              {/* Properties */}
              <CustomerPropertyList
                properties={customer.properties}
                setIsAddPropertyModalOpen={setIsAddPropertyModalOpen}
                onEditProperty={handleEditProperty}
              />

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
        setCustomer={setCustomer}
      />

      <CustomerEmailModal
        isOpen={isEmailModalOpen}
        customerId={customer.id}
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
      <CustomerEditPropertyModal
        isOpen={isEditPropertyModalOpen}
        onClose={() => {
          setIsEditPropertyModalOpen(false);
          setPropertyToEdit(null);
        }}
        onUpdated={fetchCustomer}
        propertyToEdit={propertyToEdit}
      />
    </div>
  );
};

export default CustomerDetails;
