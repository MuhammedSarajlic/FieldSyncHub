import { motion } from 'framer-motion';
import {
  Briefcase,
  Building,
  Calendar,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import { TEmployee } from '../../../types/Employee';

interface IEmployeeDetailsView {
  activeEmployee: TEmployee;
  setShowQuickView: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmployeeDetailsView = ({
  activeEmployee,
  setShowQuickView,
}: IEmployeeDetailsView) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-end'
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className='w-full max-w-md bg-white h-full overflow-auto shadow-2xl'
      >
        {/* Header with gradient */}
        <div className='sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold'>Employee Profile</h2>
            <button
              onClick={() => setShowQuickView(false)}
              className='rounded-full p-1 hover:bg-white/10 transition-colors'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='flex items-center gap-5'>
            <div className='relative'>
              <img
                // src={activeEmployee.avatar}
                alt={activeEmployee.user.firstName}
                className='h-16 w-16 rounded-full border-4 border-white/30 shadow-lg'
              />
              <div className='absolute -bottom-1 -right-1'>
                {/* {getAvailabilityIndicator(activeEmployee.availability)} */}
              </div>
            </div>
            <div>
              <h3 className='text-xl font-bold'>
                {activeEmployee.user.firstName} {activeEmployee.user.lastName}
              </h3>
              <p className='text-indigo-100'>{activeEmployee.position}</p>
            </div>
          </div>
        </div>

        <div className='p-6'>
          {/* Performance meter */}
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6'>
            <div className='flex justify-between items-center mb-3'>
              <h4 className='text-sm font-semibold text-gray-700'>
                Performance
              </h4>
              <span
              // className={`text-lg font-bold ${
              //   activeEmployee.performance >= 90
              //     ? 'text-emerald-600'
              //     : activeEmployee.performance >= 75
              //     ? 'text-blue-600'
              //     : activeEmployee.performance >= 50
              //     ? 'text-amber-600'
              //     : 'text-rose-600'
              // }`}
              >
                {/* {activeEmployee.performance}% */}
                91%
              </span>
            </div>

            <div className='relative'>
              <div className='w-full bg-gray-100 rounded-full h-2.5'>
                <motion.div
                  initial={{ width: 0 }}
                  //   animate={{ width: `${activeEmployee.performance}%` }}
                  animate={{ width: `91%` }}
                  transition={{ duration: 1 }}
                  //   className={`h-2.5 rounded-full ${
                  //     activeEmployee.performance >= 90
                  //       ? 'bg-emerald-500'
                  //       : activeEmployee.performance >= 75
                  //       ? 'bg-blue-500'
                  //       : activeEmployee.performance >= 50
                  //       ? 'bg-amber-500'
                  //       : 'bg-rose-500'
                  //   }`}
                />
              </div>

              {/* Performance markers */}
              <div className='flex justify-between mt-1.5'>
                {[0, 25, 50, 75, 100].map((mark) => (
                  <div key={mark} className='relative'>
                    <div className='h-2 w-px bg-gray-200 absolute -top-3.5 left-1/2'></div>
                    <span className='text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2'>
                      {mark}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-4 grid grid-cols-3 gap-3 text-center'>
              <div>
                <div className='text-2xl font-bold text-gray-900'>
                  {/* {activeEmployee.tasksCompleted} */}
                  14
                </div>
                <div className='text-xs text-gray-500'>Tasks</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900'>
                  {/* {activeEmployee.certifications.length} */}2
                </div>
                <div className='text-xs text-gray-500'>Certs</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900'>
                  {Math.floor(
                    (new Date() - new Date(activeEmployee.hireDate)) /
                      (1000 * 60 * 60 * 24 * 30)
                  )}
                </div>
                <div className='text-xs text-gray-500'>Months</div>
              </div>
            </div>
          </div>

          {/* Info sections */}
          <div className='grid grid-cols-1 gap-5'>
            <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                <User className='h-4 w-4 mr-2 text-gray-500' />
                Personal Info
              </h4>
              <div className='space-y-3'>
                <div className='flex items-start'>
                  <Mail className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-900'>
                      {activeEmployee.user.email}
                    </p>
                    <p className='text-xs text-gray-500'>Email</p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <Phone className='h-5 w-5 text-gray-400 mr-3 mt=0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-900'>
                      {/* {activeEmployee.phone} */}
                      062409924
                    </p>
                    <p className='text-xs text-gray-500'>Phone</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                <Briefcase className='h-4 w-4 mr-2 text-gray-500' />
                Work Details
              </h4>
              <div className='space-y-3'>
                <div className='flex items-start'>
                  <Building className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-900'>
                      {activeEmployee.department}
                      IT
                    </p>
                    <p className='text-xs text-gray-500'>Department</p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <MapPin className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-900'>
                      {/* {activeEmployee.location} */}
                      Zenica
                    </p>
                    <p className='text-xs text-gray-500'>Location</p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <Calendar className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-900'>
                      {/* {formatDate(activeEmployee.hireDate)} */}
                      11.12.2025
                    </p>
                    <p className='text-xs text-gray-500'>Hire Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* {activeEmployee.certifications.length > 0 && (
              <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                  <Award className='h-4 w-4 mr-2 text-gray-500' />
                  Certifications
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {activeEmployee.certifications.map((cert, idx) => (
                    <motion.span
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100'
                    >
                      {cert}
                    </motion.span>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Action buttons */}
          <div className='mt-8 grid grid-cols-2 gap-3'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
            >
              <Mail className='h-4 w-4' />
              Message
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
            >
              Full Profile
              <ChevronRight className='h-4 w-4' />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDetailsView;
