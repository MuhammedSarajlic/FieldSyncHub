import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEmployee } from '../../../types/Employee';
import { useNavigate } from 'react-router';
import { getStatusBadge } from '../../../utils/FuntionHelpers/getStatusBadge';
import { formatDate } from '../../../utils/FuntionHelpers/formatDate';

interface IEmployeeTable {
  employees: TEmployee[];
}

const EmployeeTable = ({ employees: filteredEmployees }: IEmployeeTable) => {
  const navigate = useNavigate();

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
              ].map((header, index) => (
                <th
                  key={index}
                  scope='col'
                  className={`px-6 py-3 ${
                    header === 'Actions' ? 'text-right' : 'text-left'
                  } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredEmployees.map((employee, idx) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: idx * 0.05,
                }}
                onClick={() => navigate(`/employees/${employee.id}`)}
                className={'hover:bg-gray-50 cursor-pointer'}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      {employee.imageUrl ? (
                        <img
                          src={employee.imageUrl}
                          alt={employee.user.firstName}
                          className='h-12 w-12 rounded-full object-cover border-2 border-gray-100'
                        />
                      ) : (
                        <div className='h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-100'>
                          <User className='h-6 w-6 text-gray-500' />
                        </div>
                      )}
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
                    {employee.position ?? 'N/A'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {employee.department ?? 'N/A'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {employee.location ?? 'N/A'}
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
                  {formatDate(employee.hireDate)}
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
