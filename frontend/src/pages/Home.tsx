import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import {
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  MapPin,
} from 'lucide-react'; // Using Feather icons for example

const Home = () => {
  // Mock data - replace with your API calls
  const todayStats = {
    scheduledJobs: 14,
    completed: 8,
    overdue: 2,
    revenue: '$3,850',
  };

  const upcomingJobs = [
    {
      id: 1,
      customer: 'Smith Residence',
      time: '9:00 AM',
      service: 'AC Repair',
      tech: 'John D.',
    },
    {
      id: 2,
      customer: 'Cafe Milano',
      time: '11:30 AM',
      service: 'Plumbing',
      tech: 'Sarah K.',
    },
  ];

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />

        {/* Main Content */}
        <div className='p-6'>
          {/* Header */}
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
            <div className='flex items-center space-x-4'>
              <button className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
                <Calendar className='mr-2' size={18} />
                Today: {new Date().toLocaleDateString()}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              icon={<TrendingUp className='text-blue-500' />}
              title='Scheduled'
              value={todayStats.scheduledJobs}
              trend='+2 from yesterday'
            />
            <StatCard
              icon={<Clock className='text-green-500' />}
              title='Completed'
              value={todayStats.completed}
              trend='On track'
            />
            <StatCard
              icon={<AlertCircle className='text-red-500' />}
              title='Overdue'
              value={todayStats.overdue}
              trend='Needs attention'
            />
            <StatCard
              icon={<DollarSign className='text-purple-500' />}
              title="Today's Revenue"
              value={todayStats.revenue}
              trend='+12% from avg'
            />
          </div>

          {/* Two-Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Upcoming Jobs */}
            <div className='lg:col-span-2 bg-white rounded-xl shadow-sm p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-semibold'>Today's Schedule</h2>
                <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                  View All
                </button>
              </div>
              <div className='space-y-4'>
                {upcomingJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>

            {/* Quick Actions + Map */}
            <div className='space-y-6'>
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-lg font-semibold mb-4'>Quick Actions</h2>
                <div className='grid grid-cols-2 gap-3'>
                  <ActionButton icon={<Calendar />} label='New Job' />
                  <ActionButton icon={<DollarSign />} label='Create Invoice' />
                  <ActionButton icon={<MapPin />} label='Dispatch Board' />
                  <ActionButton icon={<TrendingUp />} label='Reports' />
                </div>
              </div>

              {/* Mini Map Placeholder */}
              <div className='bg-white rounded-xl shadow-sm p-6 h-64'>
                <h2 className='text-lg font-semibold mb-2'>Tech Locations</h2>
                <div className='bg-gray-100 rounded-lg h-full flex items-center justify-center text-gray-400'>
                  Map Integration (Google Maps/Mapbox)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ icon, title, value, trend }) => (
  <div className='bg-white p-5 rounded-xl shadow-sm'>
    <div className='flex items-center justify-between'>
      <div className='p-3 rounded-full bg-gray-100'>{icon}</div>
    </div>
    <h3 className='text-gray-500 mt-3 text-sm font-medium'>{title}</h3>
    <p className='text-2xl font-bold mt-1'>{value}</p>
    <p className='text-xs mt-2 text-gray-500'>{trend}</p>
  </div>
);

const JobCard = ({ job }) => (
  <div className='border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors'>
    <div className='flex justify-between'>
      <div>
        <h3 className='font-medium'>{job.customer}</h3>
        <p className='text-sm text-gray-600'>{job.service}</p>
      </div>
      <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded'>
        {job.time}
      </span>
    </div>
    <div className='flex items-center mt-3 text-sm text-gray-500'>
      <span className='bg-gray-100 px-2 py-1 rounded mr-2'>{job.tech}</span>
      <button className='ml-auto text-blue-600 hover:text-blue-800 text-sm'>
        Details
      </button>
    </div>
  </div>
);

const ActionButton = ({ icon, label }) => (
  <button className='flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors'>
    <div className='text-blue-600 mb-1'>{icon}</div>
    <span className='text-sm'>{label}</span>
  </button>
);

export default Home;
