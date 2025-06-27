import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Clipboard,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import PageUnderDevelopment from '../components/CustomElements/PageUnderDevelopment';

const Home = () => {
  // Minimal temporary data for the dashboard
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 14,
    pendingJobs: 5,
    completedJobs: 87,
    revenue: 28450,
    teamMembers: 8,
    fieldWorkers: 6,
    upcomingAppointments: [
      {
        id: 1,
        client: 'Peterson Residence',
        service: 'Electrical Wiring',
        time: '10:30 AM',
        status: 'confirmed',
      },
      {
        id: 2,
        client: 'Summit Office Complex',
        service: 'HVAC Maintenance',
        time: '1:15 PM',
        status: 'confirmed',
      },
      {
        id: 3,
        client: 'Riverside Apartments',
        service: 'Plumbing Repair',
        time: '3:00 PM',
        status: 'pending',
      },
    ],
    alerts: [
      {
        id: 1,
        message: 'Inventory low: Copper wire (10 AWG)',
        urgency: 'medium',
      },
      { id: 2, message: 'Vehicle #3 maintenance due', urgency: 'high' },
    ],
  });

  // Simulate loading data
  useEffect(() => {
    // In a real app, this would be an API call
    // setDashboardData(fetchedData);

    // Just to simulate loading - remove in production
    const timer = setTimeout(() => {
      console.log('Dashboard data loaded');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const [isConstruction, setIsConstruction] = useState<boolean>(true);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />

        {!isConstruction ? (
          <div className='p-6'>
            <div className='mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>
                Dashboard Overview
              </h1>
              <p className='text-gray-600'>
                Welcome back! Here's your business at a glance.
              </p>
            </div>

            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-medium text-gray-600'>Active Jobs</h3>
                  <div className='p-2 bg-blue-100 rounded-full'>
                    <Clipboard size={20} className='text-blue-600' />
                  </div>
                </div>
                <p className='text-3xl font-bold text-gray-800'>
                  {dashboardData.activeJobs}
                </p>
                <p className='mt-2 text-sm text-gray-500'>
                  {dashboardData.pendingJobs} jobs pending
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-medium text-gray-600'>Monthly Revenue</h3>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <DollarSign size={20} className='text-green-600' />
                  </div>
                </div>
                <p className='text-3xl font-bold text-gray-800'>
                  ${dashboardData.revenue.toLocaleString()}
                </p>
                <p className='mt-2 text-sm text-gray-500'>
                  <span className='text-green-500'>↑ 12%</span> from last month
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-medium text-gray-600'>Team Members</h3>
                  <div className='p-2 bg-purple-100 rounded-full'>
                    <Users size={20} className='text-purple-600' />
                  </div>
                </div>
                <p className='text-3xl font-bold text-gray-800'>
                  {dashboardData.teamMembers}
                </p>
                <p className='mt-2 text-sm text-gray-500'>
                  {dashboardData.fieldWorkers} currently in the field
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-medium text-gray-600'>Completed Jobs</h3>
                  <div className='p-2 bg-emerald-100 rounded-full'>
                    <CheckCircle size={20} className='text-emerald-600' />
                  </div>
                </div>
                <p className='text-3xl font-bold text-gray-800'>
                  {dashboardData.completedJobs}
                </p>
                <p className='mt-2 text-sm text-gray-500'>
                  <span className='text-emerald-500'>98%</span> customer
                  satisfaction
                </p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Today's Schedule */}
              <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    Today's Schedule
                  </h2>
                  <div className='flex items-center text-blue-600'>
                    <Calendar size={16} className='mr-1' />
                    <span className='text-sm'>May 5, 2025</span>
                  </div>
                </div>

                <div className='divide-y'>
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className='py-3 flex items-center justify-between'
                    >
                      <div>
                        <p className='font-medium text-gray-800'>
                          {appointment.client}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {appointment.service}
                        </p>
                      </div>
                      <div className='flex items-center'>
                        <Clock size={14} className='mr-1 text-gray-500' />
                        <span className='text-sm text-gray-600 mr-3'>
                          {appointment.time}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {appointment.status === 'confirmed'
                            ? 'Confirmed'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-4 text-center'>
                  <button className='text-blue-600 text-sm hover:underline'>
                    View Full Schedule
                  </button>
                </div>
              </div>

              {/* Alerts & Notifications */}
              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    Alerts & Notifications
                  </h2>
                  <div className='p-1 bg-red-100 rounded-full'>
                    <AlertTriangle size={16} className='text-red-600' />
                  </div>
                </div>

                <div className='space-y-4'>
                  {dashboardData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-md ${
                        alert.urgency === 'high' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          alert.urgency === 'high'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className='mt-8'>
                  <h3 className='text-base font-medium text-gray-800 mb-3'>
                    Quick Actions
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <button className='bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm'>
                      Create Job
                    </button>
                    <button className='bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 text-sm'>
                      Add Client
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className='mt-6 bg-white p-6 rounded-lg shadow'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-gray-800'>
                  Performance Summary
                </h2>
                <div className='flex items-center text-blue-600'>
                  <TrendingUp size={16} className='mr-1' />
                  <span className='text-sm'>Monthly Overview</span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='border-r border-gray-200 pr-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Job Completion Rate
                  </h3>
                  <p className='text-2xl font-bold text-gray-800'>92%</p>
                  <p className='text-xs text-green-600'>↑ 3% from last month</p>
                </div>

                <div className='border-r border-gray-200 md:px-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Average Response Time
                  </h3>
                  <p className='text-2xl font-bold text-gray-800'>1.2 hrs</p>
                  <p className='text-xs text-green-600'>
                    ↓ 0.3 hrs from last month
                  </p>
                </div>

                <div className='md:pl-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Client Retention
                  </h3>
                  <p className='text-2xl font-bold text-gray-800'>89%</p>
                  <p className='text-xs text-yellow-600'>
                    ↓ 2% from last month
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PageUnderDevelopment />
        )}
      </div>
    </div>
  );
};

export default Home;
