import { Calendar } from 'lucide-react';
import { TAddJob } from '../../../../types/Job';

interface INewJobModalScheduleSection {
  newJob: TAddJob;
  setNewJob: React.Dispatch<React.SetStateAction<TAddJob>>;
}

const NewJobModalScheduleSection = ({
  newJob,
  setNewJob,
}: INewJobModalScheduleSection) => {
  const handleJobTypeChange = (type: 'one-time' | 'recurring') => {
    setNewJob((prev) => ({ ...prev, jobType: type }));
  };
  return (
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
                      duration: parseInt(e.target.value),
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
  );
};

export default NewJobModalScheduleSection;
