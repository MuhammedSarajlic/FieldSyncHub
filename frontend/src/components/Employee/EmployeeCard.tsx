import { motion } from 'framer-motion';
import { ChevronRight, Mail, Phone } from 'lucide-react';
import { TEmployee } from '../../types/Employee';
import images from '../../constants/images';
import { useNavigate } from 'react-router';

interface IEmployeeCard {
  employee: TEmployee;
  getStatusBadge: (status: string) => { background: string; indicator: string };
}

const EmployeeCard = ({ employee, getStatusBadge }: IEmployeeCard) => {
  const navigate = useNavigate();
  const { background, indicator } = getStatusBadge(employee.status);
  return (
    <div className='relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col h-full'>
      {/* Status Badge */}
      <div className='absolute top-3 right-3 z-10'>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${background}`}
        >
          <span
            className={`h-1.5 w-1.5 mr-1.5 rounded-full ${indicator}`}
          ></span>
          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
        </span>
      </div>

      {/* Main Content */}
      <div className='p-5 flex-grow flex flex-col'>
        <div className='flex items-start space-x-4'>
          <div className='flex-shrink-0'>
            <img
              src={images.img}
              alt={employee.user.firstName}
              className='h-16 w-16 rounded-full object-cover border-2 border-gray-100'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-lg font-semibold text-gray-900 truncate'>
              {employee.user.firstName} {employee.user.lastName}
            </h3>
            <p className='text-sm text-gray-600 truncate'>
              {employee.position}
            </p>

            {/* Contact Info */}
            <div className='mt-2 flex flex-col gap-y-1 text-sm'>
              <div className='flex items-start text-gray-600'>
                <Mail className='h-4 w-4 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0' />
                <span className='break-all'>{employee.user.email}</span>
              </div>
              <div className='flex items-start text-gray-600'>
                <Phone className='h-4 w-4 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0' />
                <span>{employee.user.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='mt-4 pt-4 border-t border-gray-100'>
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div>
              <div className='text-sm font-medium text-gray-900'>91</div>
              <div className='text-xs text-gray-500'>Tasks</div>
            </div>
            <div>
              <div className='text-sm font-medium text-gray-900'>24</div>
              <div className='text-xs text-gray-500'>Active</div>
            </div>
            <div>
              <div className='text-sm font-medium text-gray-900'>5</div>
              <div className='text-xs text-gray-500'>Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-5 py-3 border-t border-gray-100 bg-gray-50 mt-auto'>
        <div className='flex justify-between items-center'>
          <button
            onClick={() => navigate(`/employees/${employee.id}`)}
            className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center cursor-pointer'
          >
            View Employee
            <ChevronRight className='h-4 w-4 ml-1' />
          </button>
          <div className='flex space-x-2'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className='p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-all'
              title='Send email'
            >
              <Mail className='h-4 w-4' />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className='p-1.5 text-gray-500 hover:text-green-600 rounded hover:bg-green-50 transition-all'
              title='Call'
            >
              <Phone className='h-4 w-4' />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
