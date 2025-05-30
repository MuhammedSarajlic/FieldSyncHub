import { useEffect, useState } from 'react';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import icons from '../../constants/icons';
import CustomerDetailsTab from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTab';
import CustomerInformation from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerInformation';
import CustomerTags from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerTags';
import CustomerNotes from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerNotes';
import CustomerJobs from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerJobTab/CustomerJobs';
import CustomerRequests from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerRequestTab/CustomerRequests';
import CustomerQuotes from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerQuoteTab/CustomerQuotes';
import CustomerInvoices from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerDetailsTabs/CustomerInvoiceTab/CustomerInvoices';
import CustomerProperties from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerProperties/CustomerProperties';
import { useNavigate, useParams } from 'react-router';
import { ArchiveCustomer, GetCustomerById } from '../../services/Customer';
import { TCustomer } from '../../types/Customer';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>('jobs');
  const [customer, setCustomer] = useState<TCustomer>();
  const { customerId } = useParams();

  const fetchCustomer = async () => {
    const response = await GetCustomerById(customerId as string);
    if (response.data.success) {
      setCustomer(response.data.payload);
    }
    console.log(response);
  };

  const archiveCustomer = async () => {
    const response = await ArchiveCustomer(customerId as string);
    if (response.status === 200) {
      navigate('/customers');
    }
    console.log(response);
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (!customer) {
    return <p>Loading...</p>;
  }

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar customer={customer} />
        </div>
        <div className='w-full px-4 flex items-start space-x-8'>
          <div className='w-2/3 space-y-6'>
            <div className='flex items-center space-x-3'>
              <div className='bg-[#FAFAFA] p-4 rounded-full flex items-center justify-center'>
                <img
                  src={customer.isCompany ? icons.officeIcon : icons.personIcon}
                  alt='office'
                  className='w-5 h-5'
                />
              </div>
              <div>
                <p className='text-3xl font-extrabold text-heading'>
                  {customer.isCompany
                    ? customer.companyName
                    : `${customer.firstName} ${customer.lastName}`}
                </p>
                {customer.isCompany && (
                  <p className='text-primary'>
                    {customer.firstName} {customer.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className='p-4 border-[1px] border-border-primary rounded-lg'>
              <p className='font-semibold text-lg mb-4'>Customer Summary</p>
              <div className='w-full flex items-center justify-between space-x-4'>
                <div className='w-1/4 bg-[#FAFAFA] rounded-lg space-y-1 p-3'>
                  <p className='text-sm text-heading'>Lifetime Value</p>
                  <p className='font-semibold'>$12,580.00</p>
                </div>
                <div className='w-1/4 bg-[#FAFAFA] rounded-lg space-y-1 p-3'>
                  <p className='text-sm text-heading'>Outstanding</p>
                  <p className='font-semibold text-red-600'>$420.00</p>
                </div>
                <div className='w-1/4 bg-[#FAFAFA] rounded-lg space-y-1 p-3'>
                  <p className='text-sm text-heading'>Total Jobs</p>
                  <p className='font-semibold'>8</p>
                </div>
                <div className='w-1/4 bg-[#FAFAFA] rounded-lg space-y-1 p-3'>
                  <p className='text-sm text-heading'>Last Activity</p>
                  <p className='font-semibold'>15/02/2025</p>
                </div>
              </div>
            </div>
            <div className='pt-2 border-[1px] border-border-primary rounded-lg'>
              <div className='px-2 flex items-center  space-x-4'>
                <CustomerDetailsTab
                  name='Jobs'
                  tabName='jobs'
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
                <CustomerDetailsTab
                  name='Requests'
                  tabName='requests'
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
                <CustomerDetailsTab
                  name='Quotes'
                  tabName='quotes'
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
                <CustomerDetailsTab
                  name='Invoices'
                  tabName='invoices'
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
              </div>
              <div className=''>
                {selectedTab === 'jobs' && <CustomerJobs />}
                {selectedTab === 'requests' && <CustomerRequests />}
                {selectedTab === 'quotes' && <CustomerQuotes />}
                {selectedTab === 'invoices' && <CustomerInvoices />}
              </div>
            </div>
          </div>

          <div className='w-1/3 space-y-10'>
            <div className='w-full flex items-center justify-end space-x-2 text-re'>
              <ButtonIcon
                name='Email'
                icon={icons.mailWhiteIcon}
                customStyle='border-transparent bg-bg-primary hover:bg-bg-primary-hover'
                customTextStyle='text-white'
                customImageStyle='w-5 h-5'
              />
              <ButtonIcon name='Edit' icon={icons.editIcon} />
              <ButtonIcon
                name='Archive'
                handleBtnClick={archiveCustomer}
                icon={icons.archiveIcon}
                customTextStyle='text-red-600'
              />
            </div>
            <CustomerInformation customer={customer} />
            <CustomerTags
              tags={customer.tags}
              customerId={customer.customerId}
              fetchCustomer={fetchCustomer}
            />
            <CustomerProperties properties={customer.properties} />
            <CustomerNotes
              notes={customer.notes}
              customerId={customer.customerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
