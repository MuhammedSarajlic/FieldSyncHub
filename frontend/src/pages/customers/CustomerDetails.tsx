import { useState } from 'react';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Navbar from '../../components/Navbar';
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

const CustomerDetails = () => {
  const [selectedTab, setSelectedTab] = useState<string>('jobs');
  const customerInfo = {
    firstName: 'Muhammed',
    lastName: 'Sarajlic',
    companyName: 'INAT Digital',
    isCompany: true,
    mainPhone: '38762409924',
    homePhone: '',
    workPhone: '',
    mobilePhone: '',
    otherPhone: '',
    faxPhone: '',
    email: 'muhamed@inat.digital',
    address: 'Hamida 25',
    city: 'Zenica',
    state: 'Federacija BiH',
    country: 'Bosnia and Herzegovina',
    postalCode: '72000',
  };
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px] h-[2000px]'>
        <div>
          <Navbar />
        </div>
        <div className='w-full px-4 flex items-start space-x-8'>
          <div className='w-2/3 space-y-6'>
            <div className='flex items-center space-x-3'>
              <div className='bg-[#FAFAFA] p-4 rounded-full flex items-center justify-center'>
                <img
                  src={
                    customerInfo.isCompany ? icons.officeIcon : icons.personIcon
                  }
                  alt='office'
                  className='w-5 h-5'
                />
              </div>
              <div>
                <p className='text-3xl font-extrabold text-heading'>
                  {customerInfo.isCompany
                    ? customerInfo.companyName
                    : `${customerInfo.firstName} ${customerInfo.lastName}`}
                </p>
                {customerInfo.isCompany && (
                  <p className='text-primary'>
                    {customerInfo.firstName} {customerInfo.lastName}
                  </p>
                )}
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
                icon={icons.archiveIcon}
                customTextStyle='text-red-600'
              />
            </div>
            <CustomerInformation />
            <CustomerTags />
            <CustomerNotes />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
