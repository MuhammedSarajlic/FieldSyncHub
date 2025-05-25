import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEmployee } from '../../../types/Employee';
import images from '../../../constants/images';

interface IEmployeeTable {
  employees: TEmployee[];
  getStatusBadge: (status: string) => { background: string; indicator: string };
}

const EmployeeTable = ({
  employees: filteredEmployees,
  getStatusBadge,
}: IEmployeeTable) => {
  return (
    <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {[
                'Employee',
                'Position',
                'Department',
                'Location',
                'Status',
                'Hire Date',
                'Actions',
              ].map((header, index) => (
                <th
                  key={index}
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredEmployees.map((employee, idx) => (
              // const { background, indicator } = getStatusBadge(employee.status);
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: idx * 0.05,
                }}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10 relative'>
                      <img
                        src={images.img}
                        alt={employee.user.firstName}
                        className='h-10 w-10 rounded-full'
                      />
                      <div className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500'></div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {employee.user.firstName} {employee.user.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {employee.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {employee.position ?? 'position'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {/* {employee.department} */}
                    dep
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {/* {employee.location} */}
                    location
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadge(employee.status).background
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 mr-1.5 rounded-full ${
                        getStatusBadge(employee.status).indicator
                      }`}
                    ></span>
                    {employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {/* {formatDate(employee.hireDate)} */}
                  11.02.2025
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex space-x-1 justify-end'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className='text-blue-600 hover:text-blue-900 p-1'
                    >
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className='text-gray-500 hover:text-gray-700 p-1'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
