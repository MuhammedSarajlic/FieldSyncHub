import { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  PlusCircle,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  BarChart2,
  GitBranch,
  Settings,
  Construction,
} from 'lucide-react';
import PageUnderDevelopment from '../components/CustomElements/PageUnderDevelopment';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  // Sample data for campaigns
  const campaigns = [
    {
      id: 1,
      name: 'Winter Heating Special',
      type: 'Email',
      sentDate: 'Feb 15, 2025',
      sent: 234,
      opened: 167,
      clicked: 89,
      converted: 12,
      status: 'Sent',
    },
    {
      id: 2,
      name: 'Spring AC Tune-Up',
      type: 'SMS',
      sentDate: 'Mar 10, 2025',
      sent: 456,
      opened: '-',
      clicked: 112,
      converted: 28,
      status: 'Sent',
    },
    {
      id: 3,
      name: 'Customer Feedback Survey',
      type: 'Email',
      sentDate: 'Apr 02, 2025',
      sent: 198,
      opened: 145,
      clicked: 67,
      converted: 8,
      status: 'Sent',
    },
    {
      id: 4,
      name: 'Memorial Day Special',
      type: 'Email',
      sentDate: '-',
      sent: '-',
      opened: '-',
      clicked: '-',
      converted: '-',
      status: 'Draft',
    },
  ];

  // Sample data for templates
  const templates = [
    {
      id: 1,
      name: 'Spring AC Tune-Up Reminder',
      type: 'Email',
      category: 'Seasonal',
    },
    {
      id: 2,
      name: 'Winter Furnace Maintenance',
      type: 'Email',
      category: 'Seasonal',
    },
    {
      id: 3,
      name: 'We Miss You! 10% Off',
      type: 'SMS',
      category: 'Re-engagement',
    },
    {
      id: 4,
      name: 'Refer a Friend - $50 Credit',
      type: 'Email',
      category: 'Referral',
    },
    { id: 5, name: 'Service Reminder', type: 'SMS', category: 'Maintenance' },
  ];

  // Sample data for audience segments
  const segments = [
    { id: 1, name: 'VIP Customers', count: 78, lastUpdated: 'Apr 25, 2025' },
    {
      id: 2,
      name: 'Customers in Phoenix',
      count: 143,
      lastUpdated: 'Apr 20, 2025',
    },
    {
      id: 3,
      name: 'Expiring Warranties',
      count: 56,
      lastUpdated: 'Apr 22, 2025',
    },
    {
      id: 4,
      name: 'Outstanding Invoices',
      count: 32,
      lastUpdated: 'Apr 28, 2025',
    },
  ];

  // Sample data for report metrics
  const reportMetrics = [
    { label: 'Total Campaigns', value: '12', change: '+3' },
    { label: 'Avg. Open Rate', value: '32%', change: '+5%' },
    { label: 'Avg. Click Rate', value: '18%', change: '+2%' },
    { label: 'Jobs Booked', value: '48', change: '+15' },
    { label: 'Revenue Generated', value: '$24,650', change: '+$8,200' },
  ];

  const [isConstruction, setIsConstruction] = useState<boolean>(true);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
        <Navbar />
        {!isConstruction ? (
          <div className='p-6 overflow-y-auto'>
            {/* Page Header */}
            <div className='flex justify-between items-center mb-8'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>Marketing</h1>
                <p className='text-gray-600'>
                  Create campaigns and grow your business
                </p>
              </div>
              <button className='bg-bg-primary hover:bg-bg-primary-hover text-white py-2 px-4 rounded-lg flex items-center'>
                <PlusCircle size={18} className='mr-2' />
                Create Campaign
              </button>
            </div>

            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-8'>
              {reportMetrics.map((metric, index) => (
                <div key={index} className='bg-white p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>{metric.label}</p>
                  <div className='flex items-end mt-1'>
                    <span className='text-xl font-semibold text-gray-800'>
                      {metric.value}
                    </span>
                    <span
                      className={`ml-2 text-xs ${
                        metric.change.startsWith('+')
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className='border-b border-gray-200 mb-6'>
              <nav className='flex space-x-8'>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeTab === 'campaigns'
                      ? 'border-bg-primary text-bg-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('campaigns')}
                >
                  <Mail size={16} className='mr-2' />
                  Campaigns
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeTab === 'templates'
                      ? 'border-bg-primary text-bg-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('templates')}
                >
                  <FileText size={16} className='mr-2' />
                  Templates
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeTab === 'audiences'
                      ? 'border-bg-primary text-bg-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('audiences')}
                >
                  <Users size={16} className='mr-2' />
                  Audience Segments
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeTab === 'automations'
                      ? 'border-bg-primary text-bg-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('automations')}
                >
                  <GitBranch size={16} className='mr-2' />
                  Automations
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeTab === 'integrations'
                      ? 'border-bg-primary text-bg-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('integrations')}
                >
                  <Settings size={16} className='mr-2' />
                  Integrations
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'campaigns' && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold'>Campaign History</h2>
                  <div className='flex space-x-2'>
                    <input
                      type='text'
                      placeholder='Search campaigns...'
                      className='border border-gray-300 rounded-md px-3 py-2 text-sm'
                    />
                    <select className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                      <option>All Types</option>
                      <option>Email</option>
                      <option>SMS</option>
                    </select>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Campaign Name
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Type
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Sent Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Sent
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Opened
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Clicked
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Converted
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
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {campaign.name}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                campaign.type === 'Email'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {campaign.type}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {campaign.sentDate}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {campaign.sent}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {campaign.opened}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {campaign.clicked}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {campaign.converted}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                campaign.status === 'Sent'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <button className='text-bg-primary hover:text-bg-primary-hover'>
                              View
                            </button>
                            <span className='mx-2 text-gray-300'>|</span>
                            <button className='text-gray-600 hover:text-gray-800'>
                              Clone
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-lg font-semibold'>Templates Library</h2>
                  <button className='bg-bg-primary hover:bg-bg-primary-hover text-white py-2 px-4 rounded-lg flex items-center text-sm'>
                    <PlusCircle size={16} className='mr-2' />
                    New Template
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className='border border-gray-200 rounded-lg overflow-hidden'
                    >
                      <div className='p-4 bg-gray-50 border-b border-gray-200'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.type === 'Email'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          } mb-2`}
                        >
                          {template.type}
                        </span>
                        <h3 className='font-medium'>{template.name}</h3>
                        <p className='text-sm text-gray-500 mt-1'>
                          Category: {template.category}
                        </p>
                      </div>
                      <div className='p-4 flex justify-between'>
                        <button className='text-bg-primary hover:text-bg-primary-hover text-sm'>
                          Preview
                        </button>
                        <button className='text-bg-primary hover:text-bg-primary-hover text-sm'>
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audiences' && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-lg font-semibold'>Audience Segments</h2>
                  <button className='bg-bg-primary hover:bg-bg-primary-hover text-white py-2 px-4 rounded-lg flex items-center text-sm'>
                    <PlusCircle size={16} className='mr-2' />
                    Create Segment
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className='border border-gray-200 rounded-lg p-5'
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='font-medium text-lg'>
                            {segment.name}
                          </h3>
                          <p className='text-sm text-gray-500 mt-1'>
                            Last updated: {segment.lastUpdated}
                          </p>
                        </div>
                        <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                          {segment.count} contacts
                        </span>
                      </div>
                      <div className='mt-4 flex space-x-3'>
                        <button className='text-bg-primary hover:text-bg-primary-hover text-sm'>
                          Edit
                        </button>
                        <button className='text-bg-primary hover:text-bg-primary-hover text-sm'>
                          Send Campaign
                        </button>
                        <button className='text-gray-600 hover:text-gray-800 text-sm'>
                          Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'automations' && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h2 className='text-lg font-semibold'>
                      Marketing Automations
                    </h2>
                    <p className='text-sm text-gray-500'>
                      Set up rules to automatically send messages based on
                      triggers
                    </p>
                  </div>
                  <button className='bg-bg-primary hover:bg-bg-primary-hover text-white py-2 px-4 rounded-lg flex items-center text-sm'>
                    <PlusCircle size={16} className='mr-2' />
                    Create Automation
                  </button>
                </div>

                <div className='bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center'>
                  <div className='mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4'>
                    <GitBranch size={24} className='text-gray-400' />
                  </div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    No automations yet
                  </h3>
                  <p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
                    Create your first automation to send messages automatically
                    based on customer actions or time triggers.
                  </p>
                  <button className='mt-4 bg-bg-primary hover:bg-bg-primary-hover text-white py-2 px-4 rounded-lg text-sm'>
                    Get Started
                  </button>
                </div>

                <div className='mt-6 border-t border-gray-200 pt-6'>
                  <h3 className='text-sm font-medium text-gray-900 mb-4'>
                    Sample automations you can create:
                  </h3>
                  <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <li className='flex'>
                      <div className='flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-bg-primary/10 text-bg-primary'>
                        <Calendar size={14} />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-gray-900'>
                          Annual Service Reminder
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Send reminder 11 months after last service
                        </p>
                      </div>
                    </li>
                    <li className='flex'>
                      <div className='flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-bg-primary/10 text-bg-primary'>
                        <MessageSquare size={14} />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-gray-900'>
                          Re-engagement Campaign
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Send "We miss you" after 6 months of no jobs
                        </p>
                      </div>
                    </li>
                    <li className='flex'>
                      <div className='flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-bg-primary/10 text-bg-primary'>
                        <Mail size={14} />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-gray-900'>
                          Quote Follow-up
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Email if quote not accepted after 7 days
                        </p>
                      </div>
                    </li>
                    <li className='flex'>
                      <div className='flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-bg-primary/10 text-bg-primary'>
                        <BarChart2 size={14} />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-gray-900'>
                          Review Lead
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Ask for Google review 3 days after job completion
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='mb-6'>
                  <h2 className='text-lg font-semibold'>Integrations</h2>
                  <p className='text-sm text-gray-500'>
                    Connect with third-party marketing tools
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='border border-gray-200 rounded-lg p-6'>
                    <div className='h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4'>
                      <Mail size={24} className='text-red-600' />
                    </div>
                    <h3 className='font-medium'>Mailchimp</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Connect to send email campaigns through Mailchimp
                    </p>
                    <button className='mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm'>
                      Connect
                    </button>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-6'>
                    <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
                      <MessageSquare size={24} className='text-blue-600' />
                    </div>
                    <h3 className='font-medium'>Twilio</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Connect to send SMS messages through Twilio
                    </p>
                    <button className='mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm'>
                      Connect
                    </button>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-6'>
                    <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
                      <Mail size={24} className='text-green-600' />
                    </div>
                    <h3 className='font-medium'>Resend</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Connect to send emails through Resend
                    </p>
                    <button className='mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm'>
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PageUnderDevelopment />
        )}
      </div>
    </div>
  );
};

export default Marketing;
