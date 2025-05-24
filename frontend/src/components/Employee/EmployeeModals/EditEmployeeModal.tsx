import { useState } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBriefcase,
  FiHome,
} from 'react-icons/fi';
import {
  TEmployee,
  TUpdateEmployee,
  TUpdateEmployeeError,
} from '../../../types/Employee';
import { UpdateEmployee } from '../../../services/Employee';

interface IEditEmployeeModal {
  employee: TEmployee;
  onClose: () => void;
  fetchCurrentEmployee: () => Promise<void>;
}

const EditEmployeeModal = ({
  employee,
  onClose,
  fetchCurrentEmployee,
}: IEditEmployeeModal) => {
  const [updatedEmployee, setUpdatedEmployee] = useState<TUpdateEmployee>({
    id: employee.id,
    position: employee.position,
    department: employee.department,
    status: employee.status,
    hireDate: employee.hireDate.split('T')[0],
    userId: employee.userId,
    workspaceId: employee.workspaceId,
  });

  const [errors, setErrors] = useState<
    TUpdateEmployeeError | Partial<TUpdateEmployeeError>
  >({
    position: '',
    department: '',
    hireDate: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors && errors[name as keyof TUpdateEmployeeError]) {
      setErrors((prev) => ({
        ...prev,
        [name as keyof TUpdateEmployeeError]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<TUpdateEmployeeError> = {};
    if (!updatedEmployee.position) newErrors.position = 'Position is required';
    if (!updatedEmployee.department)
      newErrors.department = 'Department is required';
    if (!updatedEmployee.hireDate) newErrors.hireDate = 'Hire date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const response = await UpdateEmployee(updatedEmployee);
      if (response.status === 200) {
        await fetchCurrentEmployee();
        onClose();
      }
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-sans'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-8 py-6 border-b border-gray-100'>
          <h2 className='text-2xl font-bold text-gray-800'>Edit Employee</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100'
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className='p-8'>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* First Name */}
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  First Name
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiUser className='text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={employee.user.firstName}
                    readOnly
                    className={`pl-10 block w-full rounded-lg outline-none border border-gray-200 bg-gray-50 py-2.5 px-3 text-gray-700`}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  Last Name
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiUser className='text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={employee.user.lastName}
                    readOnly
                    className={`pl-10 block w-full rounded-lg outline-none border border-gray-200 bg-gray-50 py-2.5 px-3 text-gray-700`}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-600 mb-2'
              >
                Email
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiMail className='text-gray-400' />
                </div>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={employee.user.email}
                  readOnly
                  className={`pl-10 block w-full rounded-lg border border-gray-200 outline-none bg-gray-50 py-2.5 px-3 text-gray-700`}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Phone */}
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  Phone Number
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiPhone className='text-gray-400' />
                  </div>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={'(555) 123-4567'}
                    onChange={handleChange}
                    className='pl-10 block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='(123) 456-7890'
                  />
                </div>
              </div>

              {/* Hire Date */}
              <div>
                <label
                  htmlFor='hireDate'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  Hire Date <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiCalendar className='text-gray-400' />
                  </div>
                  <input
                    type='date'
                    id='hireDate'
                    name='hireDate'
                    value={updatedEmployee.hireDate}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.hireDate
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
                    } py-2.5 px-3 bg-white`}
                  />
                </div>
                {errors.hireDate && (
                  <p className='mt-1 text-sm text-red-600'>{errors.hireDate}</p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Position */}
              <div>
                <label
                  htmlFor='position'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  Position <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiBriefcase className='text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='position'
                    name='position'
                    value={updatedEmployee.position}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.position
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
                    } py-2.5 px-3 bg-white`}
                  />
                </div>
                {errors.position && (
                  <p className='mt-1 text-sm text-red-600'>{errors.position}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor='department'
                  className='block text-sm font-medium text-gray-600 mb-2'
                >
                  Department <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FiHome className='text-gray-400' />
                  </div>
                  <select
                    id='department'
                    name='department'
                    value={updatedEmployee.department}
                    onChange={handleChange}
                    className={`pl-9 block w-full rounded-lg border ${
                      errors.department
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
                    } py-2.5 px-3 bg-white appearance-none`}
                  >
                    <option value=''>Select Department</option>
                    <option value='Field Operations'>Field Operations</option>
                    <option value='Customer Service'>Customer Service</option>
                    <option value='Management'>Management</option>
                    <option value='Sales'>Sales</option>
                    <option value='Administration'>Administration</option>
                  </select>
                </div>
                {errors.department && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor='status'
                className='block text-sm font-medium text-gray-600 mb-2'
              >
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                id='status'
                name='status'
                value={updatedEmployee.status}
                onChange={handleChange}
                className='block w-full rounded-lg border border-gray-200 py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              >
                <option value='active'>Active</option>
                <option value='on-leave'>On Leave</option>
                <option value='terminated'>Terminated</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className='mt-10 flex justify-end space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 border border-gray-300 cursor-pointer rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50  transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex items-center px-6 py-2.5 cursor-pointer border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-bg-primary hover:bg-bg-primary-hover  transition-colors'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
