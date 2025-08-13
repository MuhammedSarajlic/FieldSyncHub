import { useEffect, useRef, useState } from 'react';
import CustomButton from '../CustomElements/Buttons/CustomButton';
import { ChevronDown, Plus, X } from 'lucide-react';
import CustomCheckbox from '../CustomElements/Checkbox/CustomCheckbox';
import IconButton from '../CustomElements/Buttons/IconButton';
import { useClickOutside } from '../../hooks/useClickOutside';
import { GetEmployeesByWorkspace } from '../../services/Employee';
import { useAuth } from '../../context/AuthProvider';
import { TEmployee } from '../../types/Employee';

const CreateEventModal = () => {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<TEmployee[]>([]);

  const fetchEmployees = async () => {
    if (!user?.workspace?.id) return;
    const response = await GetEmployeesByWorkspace(user?.workspace.id);
    if (response.status === 200) {
      setEmployees(response.data.payload);
    }
    console.log(response);
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const assignEmployeesRef = useClickOutside<HTMLDivElement>(
    () => setIsAssignEmployeeOpen(false),
    [buttonRef]
  );

  useEffect(() => {
    console.log(user);

    fetchEmployees();
  }, []);
  return (
    <div className='flex items-center justify-center absolute bg-black/50 w-full h-screen'>
      <div className='bg-white rounded-lg p-6 w-4xl space-y-6'>
        <div className='flex items-center justify-between'>
          <p className='text-2xl font-bold text-text-primary'>Create Event</p>
          <button className='p-1.5 hover:bg-gray-200 rounded-full cursor-pointer'>
            <X className='w-5.5 h-5.5' />
          </button>
        </div>
        <div className='space-y-6'>
          <div className='flex flex-col space-y-3'>
            <input
              type='text'
              placeholder='Title'
              className='p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
            />
            <textarea
              placeholder='Description'
              className='min-h-20 p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
            />
          </div>
          <div className='w-full space-x-8 flex items-start'>
            <div className='w-3/5 space-y-6'>
              <p className='text-xl font-semibold text-text-primary'>
                Schedule
              </p>
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <div className='w-full flex items-center text-text-primary'>
                    <p className='w-2/3 text-sm font-semibold'>Start date</p>
                    <p className='w-1/3 text-sm font-semibold'>Start time</p>
                  </div>
                  <div className='w-full'>
                    <input
                      type='date'
                      className='w-2/3 h-12 py-2.5 px-4 text-sm outline-none border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                    <input
                      type='time'
                      className='w-1/3 h-12 py-2.5 px-4 text-sm outline-none border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <div className='w-full flex items-center text-text-primary'>
                    <p className='w-2/3 text-sm font-semibold'>End date</p>
                    <p className='w-1/3 text-sm font-semibold'>End time</p>
                  </div>
                  <div className='w-full'>
                    <input
                      type='date'
                      className='w-2/3 h-12 py-2.5 px-4 text-sm outline-none border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                    <input
                      type='time'
                      className='w-1/3 h-12 py-2.5 px-4 text-sm outline-none border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                  </div>
                </div>
                <div className='flex'>
                  <CustomCheckbox
                    setChecked={setChecked}
                    checked={checked}
                    checkboxSize='w-4.5 h-4.5'
                  />
                  <span className='ml-2 text-sm text-gray-700'>All day</span>
                </div>
              </div>
              <div>
                <label
                  htmlFor='reccurence-select'
                  className='text-sm text-text-primary font-semibold'
                >
                  Repeats
                </label>
                <div className='relative mt-1'>
                  <select
                    id='reccurence-select'
                    className='w-full px-4 py-2.5 pr-10 text-sm text-text-primary bg-white border border-gray-300 rounded-lg appearance-none hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1 transition-all'
                  >
                    <option value=''>Never</option>
                    <option value='option1'>Daily</option>
                    <option value='option2'>Weekly</option>
                    <option value='option3'>Monthly</option>
                    <option value='option4'>Yearly</option>
                    <option value='option4'>Custom</option>
                  </select>

                  <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
                    <ChevronDown className='w-4.5 h-4.5 text-gray-600' />
                  </div>
                </div>
              </div>
            </div>
            <div className='w-2/5'>
              <div className='relative flex items-center justify-between mb-2'>
                <p className='text-xl font-semibold text-text-primary'>
                  Assign Team
                </p>
                <IconButton
                  ref={buttonRef}
                  icon={<Plus className='w-4 h-4 text-bg-primary mr-1' />}
                  onClick={() => setIsAssignEmployeeOpen((prev) => !prev)}
                  customStyle='text-bg-primary! hover:border-bg-primary hover:bg-bg-primary/5'
                >
                  Assign
                </IconButton>
                {isAssignEmployeeOpen && (
                  <div
                    ref={assignEmployeesRef}
                    className='min-w-[250px] absolute right-0 top-9 bg-white shadow-2xl rounded-lg overflow-hidden'
                  >
                    <div className='px-2 py-1 bg-bg-primary/20 text-sm font-semibold text-text-primary'>
                      <p>Employees</p>
                    </div>
                    <div className='px-2 py-2'>
                      {employees.map((employee) => (
                        <div
                          key={employee.id}
                          className='py-1 flex items-center space-x-2 text-sm text-text-primary font-medium'
                        >
                          <CustomCheckbox
                            checked={assignedEmployees.some(
                              (e) => e.id === employee.id
                            )}
                            setChecked={() =>
                              setAssignedEmployees((prev) =>
                                prev.some((e) => e.id === employee.id)
                                  ? prev.filter((e) => e.id !== employee.id)
                                  : [...prev, employee]
                              )
                            }
                            checkboxSize='w-4.5 h-4.5'
                          />
                          <p>{employee.user.fullName}</p>
                        </div>
                      ))}
                      {/* <div className='py-1 flex items-center space-x-2 text-sm text-text-primary font-medium'>
                        <CustomCheckbox
                          checked={true}
                          setChecked={() => {}}
                          checkboxSize='w-4.5 h-4.5'
                        />
                        <p>Muhammed Sarajlic</p>
                      </div>
                      <div className='py-1 flex items-center space-x-2 text-sm text-text-primary font-medium'>
                        <CustomCheckbox
                          checked={false}
                          setChecked={() => {}}
                          checkboxSize='w-4.5 h-4.5'
                        />
                        <p>Faris Doric</p>
                      </div>
                      <div className='py-1 flex items-center space-x-2 text-sm text-text-primary font-medium'>
                        <CustomCheckbox
                          checked={false}
                          setChecked={() => {}}
                          checkboxSize='w-4.5 h-4.5'
                        />
                        <p>Ismail Ganibegovic</p>
                      </div> */}
                    </div>
                  </div>
                )}
              </div>
              <p className='text-sm text-gray-500'>
                Assign employees to appointment on Monday, August 4, 2025 2:00
                PM.
              </p>
              <div className='mt-4'>
                {assignedEmployees.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {assignedEmployees.map((emp) => (
                      <div className='px-2 py-1 flex items-center space-x-1.5 text-xs font-medium border border-gray-200 rounded-full text-text-primary'>
                        <p>{emp.user.fullName}</p>
                        <button
                          onClick={() =>
                            setAssignedEmployees((prev) =>
                              prev.filter((e) => e.id !== emp.id)
                            )
                          }
                        >
                          <X className='w-3.5 h-3.5 cursor-pointer text-text-primary hover:text-red-600' />
                        </button>
                      </div>
                    ))}
                    {/* <div className='px-2 py-1 flex items-center space-x-1.5 text-xs font-medium border border-gray-200 rounded-full text-text-primary'>
                    <p>Muhammed Sarajlic</p>
                    <X className='w-3.5 h-3.5 cursor-pointer text-text-primary hover:text-red-600' />
                  </div>
                  <div className='px-2 py-1 flex items-center space-x-1.5 text-xs font-medium border border-gray-200 rounded-full text-text-primary'>
                    <p>Ismail Ganibegovic</p>
                    <X className='w-3.5 h-3.5 cursor-pointer text-text-primary hover:text-red-600' />
                  </div>
                  <div className='px-2 py-1 flex items-center space-x-1.5 text-xs font-medium border border-gray-200 rounded-full text-text-primary'>
                    <p>Faris Doric</p>
                    <X className='w-3.5 h-3.5 cursor-pointer text-text-primary hover:text-red-600' />
                  </div> */}
                  </div>
                ) : (
                  <p className='text-text-primary text-sm italic'>
                    No users are currently assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-end space-x-3 mt-6'>
          <CustomButton onClick={() => {}} customStyle='py-2 px-4'>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={() => {}}
            customStyle='py-2 px-4 bg-bg-primary text-white border-bg-primary hover:bg-bg-primary-hover'
          >
            Save
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
