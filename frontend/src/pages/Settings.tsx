import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar';
import {
  FiUser,
  FiUsers,
  FiCalendar,
  FiBook,
  FiCreditCard,
  FiFileText,
  FiMessageSquare,
  FiLink,
  FiTrello,
  FiPieChart,
  FiLock,
  FiSmartphone,
  FiHelpCircle,
  FiSettings,
} from 'react-icons/fi';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: <FiSettings /> },
    { id: 'users', name: 'Users & Roles', icon: <FiUsers /> },
    { id: 'scheduling', name: 'Scheduling', icon: <FiCalendar /> },
    { id: 'pricebook', name: 'Pricebook', icon: <FiBook /> },
    { id: 'payments', name: 'Payments & Invoices', icon: <FiCreditCard /> },
    { id: 'quotes', name: 'Quotes & Requests', icon: <FiFileText /> },
    { id: 'communication', name: 'Communication', icon: <FiMessageSquare /> },
    { id: 'integrations', name: 'Integrations', icon: <FiLink /> },
    { id: 'marketing', name: 'Marketing', icon: <FiTrello /> },
    { id: 'reports', name: 'Reports', icon: <FiPieChart /> },
    { id: 'security', name: 'Security', icon: <FiLock /> },
    { id: 'mobile', name: 'Mobile App', icon: <FiSmartphone /> },
    { id: 'help', name: 'Help & Support', icon: <FiHelpCircle /> },
    { id: 'advanced', name: 'Advanced', icon: <FiSettings /> },
  ];

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <Navbar />
        <div className='p-6'>
          <h1 className='text-2xl font-bold mb-6'>Settings</h1>

          {/* Tabs */}
          <div className='border-b border-gray-200 mb-6'>
            <div className='flex overflow-x-auto'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className='mr-2'>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            {activeTab === 'general' && <CompanyProfile />}
            {activeTab === 'users' && <UsersAndPermissions />}
            {activeTab === 'scheduling' && <SchedulingSettings />}
            {activeTab === 'pricebook' && <PricebookSettings />}
            {activeTab === 'payments' && <InvoiceSettings />}
            {activeTab === 'quotes' && <QuotesSettings />}
            {activeTab === 'communication' && <CommunicationSettings />}
            {activeTab === 'integrations' && <IntegrationsSettings />}
            {activeTab === 'marketing' && <MarketingSettings />}
            {activeTab === 'reports' && <ReportsSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'mobile' && <MobileAppSettings />}
            {activeTab === 'help' && <HelpSupportSettings />}
            {activeTab === 'advanced' && <AdvancedSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Company Profile Component
const CompanyProfile = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Company Profile</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Company Name
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='Your Company Name'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Logo
          </label>
          <div className='flex items-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4'>
              <FiUser className='text-gray-400' size={24} />
            </div>
            <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
              Upload Logo
            </button>
          </div>
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Business Address
          </label>
          <textarea
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            rows={3}
            placeholder='Enter your business address'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Phone Number
          </label>
          <input
            type='tel'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='(555) 555-5555'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Email Address
          </label>
          <input
            type='email'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='contact@yourcompany.com'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Website
          </label>
          <input
            type='url'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='https://yourcompany.com'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Time Zone
          </label>
          <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
            <option>Eastern Time (ET)</option>
            <option>Central Time (CT)</option>
            <option>Mountain Time (MT)</option>
            <option>Pacific Time (PT)</option>
            <option>Alaska Time (AKT)</option>
            <option>Hawaii-Aleutian Time (HST)</option>
          </select>
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Business Hours
          </label>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Day</p>
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='monday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='monday'>Monday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='tuesday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='tuesday'>Tuesday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='wednesday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='wednesday'>Wednesday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='thursday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='thursday'>Thursday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='friday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='friday'>Friday</label>
                </div>
                <div className='flex items-center'>
                  <input type='checkbox' id='saturday' className='mr-2' />
                  <label htmlFor='saturday'>Saturday</label>
                </div>
                <div className='flex items-center'>
                  <input type='checkbox' id='sunday' className='mr-2' />
                  <label htmlFor='sunday'>Sunday</label>
                </div>
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Open</p>
              <div className='space-y-2'>
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='09:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='10:00'
                />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Close</p>
              <div className='space-y-2'>
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='15:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='14:00'
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            License Numbers
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter license numbers for regulated trades'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Tax ID (optional)
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter Tax ID'
          />
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Users & Permissions Component
const UsersAndPermissions = () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Technician',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Dispatcher',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'Office Staff',
      status: 'Inactive',
    },
  ];

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Users & Permissions</h2>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center'>
          <span className='mr-2'>+</span> Invite New User
        </button>
      </div>

      {/* User List */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {users.map((user) => (
              <tr key={user.id}>
                <td className='px-6 py-4 whitespace-nowrap'>{user.name}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.role}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <button className='text-blue-600 hover:text-blue-900 mr-2'>
                    Edit
                  </button>
                  <button className='text-red-600 hover:text-red-900'>
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles & Permissions Section */}
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>Roles & Permissions</h3>

        <div className='border rounded-md overflow-hidden'>
          <div className='bg-gray-50 px-4 py-3 border-b'>
            <div className='grid grid-cols-5 gap-4'>
              <div className='font-medium'>Role</div>
              <div className='font-medium'>View</div>
              <div className='font-medium'>Create</div>
              <div className='font-medium'>Edit</div>
              <div className='font-medium'>Delete</div>
            </div>
          </div>

          {/* Admin Role */}
          <div className='px-4 py-3 border-b'>
            <div className='grid grid-cols-5 gap-4'>
              <div className='font-medium'>Admin</div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
            </div>
          </div>

          {/* Technician Role */}
          <div className='px-4 py-3 border-b'>
            <div className='grid grid-cols-5 gap-4'>
              <div className='font-medium'>Technician</div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' />
              </div>
              <div>
                <input type='checkbox' />
              </div>
              <div>
                <input type='checkbox' />
              </div>
            </div>
          </div>

          {/* Dispatcher Role */}
          <div className='px-4 py-3 border-b'>
            <div className='grid grid-cols-5 gap-4'>
              <div className='font-medium'>Dispatcher</div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' />
              </div>
            </div>
          </div>

          {/* Office Staff Role */}
          <div className='px-4 py-3'>
            <div className='grid grid-cols-5 gap-4'>
              <div className='font-medium'>Office Staff</div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' checked readOnly />
              </div>
              <div>
                <input type='checkbox' />
              </div>
              <div>
                <input type='checkbox' />
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <button className='text-blue-600 hover:text-blue-900 flex items-center'>
            <span className='mr-1'>+</span> Create New Role
          </button>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Scheduling Settings Component
const SchedulingSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>
        Dispatch & Scheduling Settings
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Default Job Duration
          </label>
          <div className='flex items-center'>
            <input
              type='number'
              className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              defaultValue='2'
            />
            <span className='ml-2'>hours</span>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Time Slot Intervals
          </label>
          <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option selected>1 hour</option>
            <option>2 hours</option>
          </select>
        </div>

        <div>
          <label className='flex items-center'>
            <input type='checkbox' className='h-4 w-4 text-blue-600' />
            <span className='ml-2 text-sm'>
              Travel Time Buffer (auto-add travel time between jobs)
            </span>
          </label>
        </div>

        <div>
          <label className='flex items-center'>
            <input type='checkbox' className='h-4 w-4 text-blue-600' />
            <span className='ml-2 text-sm'>Auto-assign technician</span>
          </label>
        </div>

        <div>
          <label className='flex items-center'>
            <input type='checkbox' className='h-4 w-4 text-blue-600' checked />
            <span className='ml-2 text-sm'>
              Enable Live Technician Tracking
            </span>
          </label>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>
            Business Hours (for scheduling)
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Day</p>
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='sch-monday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='sch-monday'>Monday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='sch-tuesday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='sch-tuesday'>Tuesday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='sch-wednesday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='sch-wednesday'>Wednesday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='sch-thursday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='sch-thursday'>Thursday</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='sch-friday'
                    defaultChecked
                    className='mr-2'
                  />
                  <label htmlFor='sch-friday'>Friday</label>
                </div>
                <div className='flex items-center'>
                  <input type='checkbox' id='sch-saturday' className='mr-2' />
                  <label htmlFor='sch-saturday'>Saturday</label>
                </div>
                <div className='flex items-center'>
                  <input type='checkbox' id='sch-sunday' className='mr-2' />
                  <label htmlFor='sch-sunday'>Sunday</label>
                </div>
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Start</p>
              <div className='space-y-2'>
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='08:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='09:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='10:00'
                />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>End</p>
              <div className='space-y-2'>
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='17:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='15:00'
                />
                <input
                  type='time'
                  className='border border-gray-300 rounded p-1'
                  defaultValue='14:00'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Pricebook Settings Component
const PricebookSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Pricebook Settings</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Default Tax Rate (%)
          </label>
          <input
            type='number'
            step='0.01'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            defaultValue='8.25'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Currency Format
          </label>
          <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
            <option>$ (USD)</option>
            <option>€ (EUR)</option>
            <option>£ (GBP)</option>
            <option>¥ (JPY)</option>
            <option>$ (CAD)</option>
            <option>$ (AUD)</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Default Unit of Measure
          </label>
          <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
            <option>hours</option>
            <option>pieces</option>
            <option>units</option>
            <option>sq. ft.</option>
            <option>linear ft.</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Default Labor Rate ($ per hour)
          </label>
          <input
            type='number'
            step='0.01'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            defaultValue='85.00'
          />
        </div>
      </div>

      <div className='mt-6'>
        <h3 className='text-lg font-medium mb-3'>Markup Rules</h3>

        <div className='border rounded-md overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Item Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Markup Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Markup Value
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              <tr>
                <td className='px-6 py-4'>Parts</td>
                <td className='px-6 py-4'>
                  <select className='border border-gray-300 rounded-md p-1'>
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </td>
                <td className='px-6 py-4'>
                  <input
                    type='number'
                    className='border border-gray-300 rounded-md p-1 w-24'
                    defaultValue='35'
                  />
                  <span className='ml-1'>%</span>
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4'>Materials</td>
                <td className='px-6 py-4'>
                  <select className='border border-gray-300 rounded-md p-1'>
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </td>
                <td className='px-6 py-4'>
                  <input
                    type='number'
                    className='border border-gray-300 rounded-md p-1 w-24'
                    defaultValue='25'
                  />
                  <span className='ml-1'>%</span>
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4'>Equipment</td>
                <td className='px-6 py-4'>
                  <select className='border border-gray-300 rounded-md p-1'>
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </td>
                <td className='px-6 py-4'>
                  <input
                    type='number'
                    className='border border-gray-300 rounded-md p-1 w-24'
                    defaultValue='20'
                  />
                  <span className='ml-1'>%</span>
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4'>Subcontractor</td>
                <td className='px-6 py-4'>
                  <select className='border border-gray-300 rounded-md p-1'>
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </td>
                <td className='px-6 py-4'>
                  <input
                    type='number'
                    className='border border-gray-300 rounded-md p-1 w-24'
                    defaultValue='15'
                  />
                  <span className='ml-1'>%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Invoice Settings Component
const InvoiceSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Payment & Invoice Settings</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-3'>Payment Methods</h3>

          <div className='space-y-3'>
            <div className='flex items-center'>
              <input type='checkbox' id='cash' className='mr-2' checked />
              <label htmlFor='cash'>Cash</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='check' className='mr-2' checked />
              <label htmlFor='check'>Check</label>
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='credit-card'
                className='mr-2'
                checked
              />
              <label htmlFor='credit-card'>Credit Card</label>
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='bank-transfer'
                className='mr-2'
                checked
              />
              <label htmlFor='bank-transfer'>Bank Transfer (ACH)</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='financing' className='mr-2' />
              <label htmlFor='financing'>Financing</label>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>Payment Processing</h3>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Default Payment Processor
            </label>
            <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
              <option>Stripe</option>
              <option>Square</option>
              <option>PayPal</option>
              <option>Authorize.net</option>
              <option>None</option>
            </select>
          </div>

          <div className='mt-4'>
            <button className='text-blue-600 hover:text-blue-900'>
              Configure Payment Gateway
            </button>
          </div>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>Invoice Settings</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Invoice Prefix
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='INV-'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Invoice Starting Number
              </label>
              <input
                type='number'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='1001'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Due Terms
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Due on receipt</option>
                <option>Net 15</option>
                <option selected>Net 30</option>
                <option>Net 60</option>
                <option>Net 90</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Late Fee
              </label>
              <div className='flex items-center'>
                <input
                  type='number'
                  className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  defaultValue='2.5'
                />
                <span className='ml-2'>%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Quotes Settings Component
const QuotesSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>
        Quotes & Service Request Settings
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-3'>Quote Settings</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Quote Prefix
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='QUO-'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Quote Starting Number
              </label>
              <input
                type='number'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='2001'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Quote Expiration
              </label>
              <div className='flex items-center'>
                <input
                  type='number'
                  className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  defaultValue='30'
                />
                <span className='ml-2'>days</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>Service Request Settings</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Request Prefix
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='REQ-'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Request Starting Number
              </label>
              <input
                type='number'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                defaultValue='3001'
              />
            </div>

            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>
                  Enable Online Service Request Form
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>
            Required Fields for Service Requests
          </h3>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Name</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Phone</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Email</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Address</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Service Type</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>Description</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input type='checkbox' className='h-4 w-4 text-blue-600' />
                <span className='ml-2 text-sm'>Preferred Date</span>
              </label>
            </div>
            <div>
              <label className='flex items-center'>
                <input type='checkbox' className='h-4 w-4 text-blue-600' />
                <span className='ml-2 text-sm'>Preferred Time</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Communication Settings Component
const CommunicationSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Communication Settings</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-3'>Email Templates</h3>

          <div className='border rounded-md overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 border-b'>
              <h4 className='font-medium'>Template Types</h4>
            </div>
            <div className='px-4 py-3 border-b hover:bg-gray-50 cursor-pointer'>
              New Service Request
            </div>
            <div className='px-4 py-3 border-b hover:bg-gray-50 cursor-pointer'>
              Quote Confirmation
            </div>
            <div className='px-4 py-3 border-b hover:bg-gray-50 cursor-pointer'>
              Appointment Confirmation
            </div>
            <div className='px-4 py-3 border-b hover:bg-gray-50 cursor-pointer'>
              Invoice
            </div>
            <div className='px-4 py-3 hover:bg-gray-50 cursor-pointer'>
              Follow-up
            </div>
          </div>

          <div className='mt-4'>
            <button className='text-blue-600 hover:text-blue-900 flex items-center'>
              <span className='mr-1'>+</span> Create New Template
            </button>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>SMS Notifications</h3>

          <div className='space-y-4'>
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>
                  Send SMS appointment reminders
                </span>
              </label>
            </div>

            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>
                  Send SMS when technician is on the way
                </span>
              </label>
            </div>

            <div>
              <label className='flex items-center'>
                <input type='checkbox' className='h-4 w-4 text-blue-600' />
                <span className='ml-2 text-sm'>
                  Send SMS for invoice notifications
                </span>
              </label>
            </div>

            <div>
              <label className='flex items-center'>
                <input type='checkbox' className='h-4 w-4 text-blue-600' />
                <span className='ml-2 text-sm'>
                  Send SMS for payment confirmations
                </span>
              </label>
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                SMS Provider
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Twilio</option>
                <option>Nexmo</option>
                <option>MessageBird</option>
                <option>None</option>
              </select>
            </div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>Automatic Notifications</h3>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Event
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    SMS
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Push
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                <tr>
                  <td className='px-6 py-4'>Service request received</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4'>Appointment scheduled</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4'>Technician on the way</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4'>Job completed</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4'>Invoice sent</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4'>Payment received</td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' checked />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                  <td className='px-6 py-4'>
                    <input type='checkbox' />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Integrations Settings Component
const IntegrationsSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Integrations</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='border rounded-md p-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-4'>
              <span className='text-blue-600 font-bold'>QB</span>
            </div>
            <div>
              <h3 className='font-medium'>QuickBooks Online</h3>
              <p className='text-sm text-gray-500'>Connected</p>
            </div>
          </div>
          <button className='text-red-600 hover:text-red-900'>
            Disconnect
          </button>
        </div>

        <div className='border rounded-md p-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-red-100 rounded-md flex items-center justify-center mr-4'>
              <span className='text-red-600 font-bold'>G</span>
            </div>
            <div>
              <h3 className='font-medium'>Google Calendar</h3>
              <p className='text-sm text-gray-500'>Not connected</p>
            </div>
          </div>
          <button className='text-blue-600 hover:text-blue-900'>Connect</button>
        </div>

        <div className='border rounded-md p-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-green-100 rounded-md flex items-center justify-center mr-4'>
              <span className='text-green-600 font-bold'>Z</span>
            </div>
            <div>
              <h3 className='font-medium'>Zapier</h3>
              <p className='text-sm text-gray-500'>Not connected</p>
            </div>
          </div>
          <button className='text-blue-600 hover:text-blue-900'>Connect</button>
        </div>

        <div className='border rounded-md p-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4'>
              <span className='text-gray-600 font-bold'>S</span>
            </div>
            <div>
              <h3 className='font-medium'>SupplyHouse</h3>
              <p className='text-sm text-gray-500'>Not connected</p>
            </div>
          </div>
          <button className='text-blue-600 hover:text-blue-900'>Connect</button>
        </div>
      </div>

      <div className='mt-6'>
        <h3 className='text-lg font-medium mb-3'>API Access</h3>

        <div className='bg-gray-50 p-4 rounded-md mb-4'>
          <p className='text-sm mb-2'>
            Use the API key below to connect custom applications to your
            account.
          </p>
          <div className='flex items-center'>
            <input
              type='text'
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2 bg-gray-100'
              value='api_key_3f8a9c12d45e67b8901..'
              readOnly
            />
            <button className='bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300'>
              Copy
            </button>
          </div>
        </div>

        <button className='text-blue-600 hover:text-blue-900'>
          Generate New API Key
        </button>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Marketing Settings Component
const MarketingSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Marketing Settings</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-3'>Email Marketing</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Provider
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>None</option>
                <option>Mailchimp</option>
                <option>Constant Contact</option>
                <option>Campaign Monitor</option>
                <option>SendGrid</option>
              </select>
            </div>

            <button className='text-blue-600 hover:text-blue-900'>
              Configure Email Provider
            </button>

            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600'
                  checked
                />
                <span className='ml-2 text-sm'>
                  Automatically add new customers to mailing list
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>Review Management</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Automatically request reviews
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Immediately after job completion</option>
                <option>24 hours after job completion</option>
                <option>48 hours after job completion</option>
                <option>1 week after job completion</option>
                <option>Never</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Preferred Review Platform
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Google</option>
                <option>Yelp</option>
                <option>Facebook</option>
                <option>Ask customer for preference</option>
              </select>
            </div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>Referral Program</h3>

          <div className='space-y-4'>
            <div>
              <label className='flex items-center'>
                <input type='checkbox' className='h-4 w-4 text-blue-600' />
                <span className='ml-2 text-sm'>
                  Enable Customer Referral Program
                </span>
              </label>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Referral Reward
                </label>
                <div className='flex items-center'>
                  <span className='mr-2'>$</span>
                  <input
                    type='number'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    defaultValue='25'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  New Customer Discount
                </label>
                <div className='flex items-center'>
                  <span className='mr-2'>$</span>
                  <input
                    type='number'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    defaultValue='25'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Reports Settings Component
const ReportsSettings = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>Reports Settings</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-3'>Favorite Reports</h3>

          <div className='space-y-2'>
            <div className='flex items-center'>
              <input type='checkbox' id='revenue' className='mr-2' checked />
              <label htmlFor='revenue'>Revenue Summary</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='jobs' className='mr-2' checked />
              <label htmlFor='jobs'>Jobs by Type</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='technician' className='mr-2' checked />
              <label htmlFor='technician'>Technician Performance</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='customer' className='mr-2' />
              <label htmlFor='customer'>Customer Acquisition</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='marketing' className='mr-2' />
              <label htmlFor='marketing'>Marketing ROI</label>
            </div>
            <div className='flex items-center'>
              <input type='checkbox' id='inventory' className='mr-2' />
              <label htmlFor='inventory'>Inventory Usage</label>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>Scheduled Reports</h3>

          <div className='space-y-4'>
            <div className='flex items-center justify-between border-b pb-2'>
              <span>Weekly Revenue</span>
              <span className='text-sm text-gray-500'>Every Monday</span>
            </div>
            <div className='flex items-center justify-between border-b pb-2'>
              <span>Monthly Performance</span>
              <span className='text-sm text-gray-500'>1st of month</span>
            </div>
            <div>
              <button className='text-blue-600 hover:text-blue-900 flex items-center'>
                <span className='mr-1'>+</span> Add Scheduled Report
              </button>
            </div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <h3 className='text-lg font-medium mb-3'>Default Report Settings</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Default Date Range
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Current Month</option>
                <option>Previous Month</option>
                <option>Current Quarter</option>
                <option>Year to Date</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Default Chart Type
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>Bar Chart</option>
                <option>Line Chart</option>
                <option>Pie Chart</option>
                <option>Area Chart</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Export Format
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Reports To
              </label>
              <input
                type='email'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='email@example.com'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end'>
        <button className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
