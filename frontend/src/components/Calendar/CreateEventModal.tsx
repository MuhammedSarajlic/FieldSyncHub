import { useEffect, useRef, useState } from 'react';
import CustomButton from '../CustomElements/Buttons/CustomButton';
import { ChevronDown, Plus, X } from 'lucide-react';
import CustomCheckbox from '../CustomElements/Checkbox/CustomCheckbox';
import IconButton from '../CustomElements/Buttons/IconButton';
import { useClickOutside } from '../../hooks/useClickOutside';
import { GetEmployeesByWorkspace } from '../../services/Employee';
import { useAuth } from '../../context/AuthProvider';
import { TEmployee } from '../../types/Employee';
import { TAddEvent } from '../../types/Event';
import {
  DayOfWeek,
  RecurrenceEndType,
  RecurrenceFrequency,
} from '../../constants/Enumeration/RecurrenceRuleEnum/RecurrenceRuleEnum';
import { TAddRecurrenceRule } from '../../types/RecurrenceRule';
import { formatDateTime } from '../../utils/CalendarHelpers';
import { CreateEvent } from '../../services/Event';

interface ICreateEventModal {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: Date | null;
}

// ====== Recurrence Rule Builder ======
const buildRecurrenceRule = (
  frequency: RecurrenceFrequency,
  startISO: string,
  end: {
    endType?: RecurrenceEndType;
    occurrenceCount?: number | null;
    endDate?: string | null;
  } = {}
): TAddRecurrenceRule => {
  const d = new Date(startISO);
  const jsDow = d.getDay(); // 0..6 (Sun..Sat)
  const dayOfMonth = d.getDate(); // 1..31
  const monthOfYear = d.getMonth() + 1; // 1..12

  const dayOfWeek = jsDow as unknown as DayOfWeek;

  const base: TAddRecurrenceRule = {
    frequency,
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeekInMonth: null,
    monthOfYear: null,
    endType: end.endType ?? RecurrenceEndType.Never,
    occurrenceCount: end.occurrenceCount ?? null,
    endDate: end.endDate ?? null,
  };

  switch (frequency) {
    case RecurrenceFrequency.Daily:
      return base;
    case RecurrenceFrequency.Weekly:
      return { ...base, daysOfWeek: [dayOfWeek] };
    case RecurrenceFrequency.Monthly:
      return { ...base, dayOfMonth };
    case RecurrenceFrequency.Yearly:
      return { ...base, monthOfYear, dayOfMonth };
    default:
      return base;
  }
};

const CreateEventModal = ({
  isOpen,
  onClose,
  selectedDay,
}: ICreateEventModal) => {
  const { user } = useAuth();
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<TEmployee[]>([]);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    RecurrenceFrequency | ''
  >('');

  const now = new Date();
  const startBase = selectedDay ? new Date(selectedDay) : now;

  const defaultStart = formatDateTime(startBase, 9, 0);
  const defaultEnd = formatDateTime(startBase, 10, 0);

  const [event, setEvent] = useState<TAddEvent>({
    workspaceId: user?.workspace?.id || '',
    title: '',
    description: '',
    assignedToIds: [],
    startDateTime: defaultStart,
    endDateTime: defaultEnd,
    isAllDay: false,
    isRecurring: false,
    recurrenceRuleId: null,
    recurrenceRule: undefined,
    createdBy: user?.id || '',
  });

  const fetchEmployees = async () => {
    if (!user?.workspace?.id) return;
    const response = await GetEmployeesByWorkspace(user?.workspace.id);
    if (response.status === 200) {
      setEmployees(response.data.payload);
    }
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const assignEmployeesRef = useClickOutside<HTMLDivElement>(
    () => setIsAssignEmployeeOpen(false),
    [buttonRef]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onFrequencyChange = (freq: RecurrenceFrequency | '') => {
    setRecurrenceFrequency(freq);

    setEvent((prev) => {
      if (!freq) {
        return {
          ...prev,
          isRecurring: false,
          recurrenceRuleId: null,
          recurrenceRule: undefined,
        };
      }
      const rule = buildRecurrenceRule(freq, prev.startDateTime);
      return {
        ...prev,
        isRecurring: true,
        recurrenceRuleId: null,
        recurrenceRule: rule,
      };
    });
  };

  const handleDateTimeChange = (
    field: 'startDateTime' | 'endDateTime',
    part: 'date' | 'time',
    value: string
  ) => {
    setEvent((prev) => {
      const [currDate, currTime] = prev[field].split('T');
      const newDate = part === 'date' ? value : currDate;
      const newTime =
        part === 'time' ? value : (currTime || '00:00:00').slice(0, 8);

      let next: TAddEvent = {
        ...prev,
        [field]: `${newDate}T${newTime}`,
      };

      if (field === 'startDateTime') {
        const [endDateOnly, endTimeOnly] = prev.endDateTime.split('T');
        if (newDate > endDateOnly) {
          next.endDateTime = `${newDate}T${endTimeOnly}`;
        } else if (
          newDate === endDateOnly &&
          new Date(`${newDate}T${newTime}`).getTime() >
            new Date(prev.endDateTime).getTime()
        ) {
          next.endDateTime = `${newDate}T${newTime}`;
        }
      }

      // Keep recurrence rule in sync
      if (
        field === 'startDateTime' &&
        next.isRecurring &&
        recurrenceFrequency
      ) {
        next.recurrenceRule = buildRecurrenceRule(
          recurrenceFrequency,
          `${newDate}T${newTime}`,
          {
            endType: next.recurrenceRule?.endType ?? RecurrenceEndType.Never,
            occurrenceCount: next.recurrenceRule?.occurrenceCount ?? null,
            endDate: next.recurrenceRule?.endDate ?? null,
          }
        );
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    const assignedEmployeeIds = assignedEmployees.map((e) => e.id);

    const payload: TAddEvent = {
      ...event,
      assignedToIds: assignedEmployeeIds,
      isRecurring: Boolean(recurrenceFrequency),
      recurrenceRule: recurrenceFrequency
        ? buildRecurrenceRule(recurrenceFrequency, event.startDateTime, {
            endType: event.recurrenceRule?.endType ?? RecurrenceEndType.Never,
            occurrenceCount: event.recurrenceRule?.occurrenceCount ?? null,
            endDate: event.recurrenceRule?.endDate ?? null,
          })
        : undefined,
      recurrenceRuleId: null,
    };

    const response = await CreateEvent(payload);
    if (response.status === 200) {
      console.log('yes');
    }
    console.log(response);

    console.log(payload);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const baseDate = selectedDay ? new Date(selectedDay) : new Date();
    const defaultStart = formatDateTime(baseDate, 9, 0);
    const defaultEnd = formatDateTime(baseDate, 10, 0);

    setEvent((prev) => ({
      ...prev,
      startDateTime: defaultStart,
      endDateTime: defaultEnd,
    }));
  }, [selectedDay]);

  if (!isOpen) return null;

  return (
    <div className='flex items-center justify-center absolute bg-black/50 w-full h-screen'>
      <div className='bg-white rounded-lg p-6 w-4xl space-y-6'>
        <div className='flex items-center justify-between'>
          <p className='text-2xl font-bold text-text-primary'>Create Event</p>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-gray-200 rounded-full cursor-pointer'
          >
            <X className='w-5.5 h-5.5' />
          </button>
        </div>
        <div className='space-y-6'>
          <div className='flex flex-col space-y-3'>
            <input
              type='text'
              name='title'
              placeholder='Title'
              value={event.title}
              onChange={handleChange}
              className='p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
            />
            <textarea
              placeholder='Description'
              name='description'
              value={event.description}
              onChange={handleChange}
              className='min-h-20 p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
            />
          </div>
          <div className='w-full space-x-8 flex items-start'>
            <div className='w-3/5 space-y-6'>
              <p className='text-xl font-semibold text-text-primary'>
                Schedule
              </p>
              <div className='space-y-4'>
                {/* Start Date/Time */}
                <div className='space-y-1'>
                  <div className='w-full flex items-center text-text-primary'>
                    <p className='w-2/3 text-sm font-semibold'>Start date</p>
                    <p className='w-1/3 text-sm font-semibold'>Start time</p>
                  </div>
                  <div className='w-full'>
                    <input
                      type='date'
                      name='startDateTime'
                      onChange={(e) =>
                        handleDateTimeChange(
                          'startDateTime',
                          'date',
                          e.target.value
                        )
                      }
                      value={event.startDateTime.split('T')[0]}
                      className='w-2/3 h-10 py-5 px-4 text-sm outline-none border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                    <input
                      type='time'
                      name='startDateTime'
                      onChange={(e) =>
                        handleDateTimeChange(
                          'startDateTime',
                          'time',
                          e.target.value
                        )
                      }
                      value={event.startDateTime.split('T')[1].slice(0, 5)}
                      className='w-1/3 h-10 py-5 px-4 text-sm outline-none border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                  </div>
                </div>
                {/* End Date/Time */}
                <div className='space-y-1'>
                  <div className='w-full flex items-center text-text-primary'>
                    <p className='w-2/3 text-sm font-semibold'>End date</p>
                    <p className='w-1/3 text-sm font-semibold'>End time</p>
                  </div>
                  <div className='w-full'>
                    <input
                      type='date'
                      name='endDateTime'
                      onChange={(e) =>
                        handleDateTimeChange(
                          'endDateTime',
                          'date',
                          e.target.value
                        )
                      }
                      value={event.endDateTime.split('T')[0]}
                      className='w-2/3 h-10 py-5 px-4 text-sm outline-none border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                    <input
                      type='time'
                      name='endDateTime'
                      onChange={(e) =>
                        handleDateTimeChange(
                          'endDateTime',
                          'time',
                          e.target.value
                        )
                      }
                      value={event.endDateTime.split('T')[1].slice(0, 5)}
                      className='w-1/3 h-10 py-5 px-4 text-sm outline-none border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-bg-primary focus:ring-offset-1'
                    />
                  </div>
                </div>
                <div className='flex'>
                  <CustomCheckbox
                    setChecked={(checked: boolean) =>
                      setEvent((prev) => ({ ...prev, isAllDay: checked }))
                    }
                    checked={event.isAllDay}
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
                    value={recurrenceFrequency}
                    onChange={(e) =>
                      onFrequencyChange(
                        e.target.value
                          ? (parseInt(e.target.value) as RecurrenceFrequency)
                          : ''
                      )
                    }
                    className='w-full px-4 py-2.5 pr-10 text-sm text-text-primary bg-white border border-gray-300 rounded-lg appearance-none hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-1 transition-all'
                  >
                    <option value=''>Never</option>
                    <option value={RecurrenceFrequency.Daily}>Daily</option>
                    <option value={RecurrenceFrequency.Weekly}>Weekly</option>
                    <option value={RecurrenceFrequency.Monthly}>Monthly</option>
                    <option value={RecurrenceFrequency.Yearly}>Yearly</option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
                    <ChevronDown className='w-4.5 h-4.5 text-gray-600' />
                  </div>
                </div>
              </div>
            </div>
            {/* Assign Employees */}
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
                    </div>
                  </div>
                )}
              </div>
              <p className='text-sm text-gray-500'>
                Assign employees to appointment on selected date/time.
              </p>
              <div className='mt-4'>
                {assignedEmployees.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {assignedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className='px-2 py-1 flex items-center space-x-1.5 text-xs font-medium border border-gray-200 rounded-full text-text-primary'
                      >
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
          <CustomButton onClick={onClose} customStyle='py-2 px-4'>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
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
