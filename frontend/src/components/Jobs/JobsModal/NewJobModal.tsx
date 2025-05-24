import { useState, useEffect } from 'react';
import { TAddJob } from '../../../types/Job';
import { GetAllCustomers } from '../../../services/Customer';
import { TCustomer } from '../../../types/Customer';
import { TProperty } from '../../../types/Property';
import { TModalLineItem } from '../../../types/LineItem';
import { useAuth } from '../../../context/AuthProvider';
import { addJobInitialState } from '../../../const/states';
import { GetEmployeesByWorkspace } from '../../../services/Employee';
import { TEmployee } from '../../../types/Employee';
import NewJobModalCustomerSection from './NewJobModalComponents/NewJobModalCustomerSection';
import NewJobModalDetailsSection from './NewJobModalComponents/NewJobModalDetailsSection';
import NewJobModalScheduleSection from './NewJobModalComponents/NewJobModalScheduleSection';
import NewJobModalTeamSection from './NewJobModalComponents/NewJobModalTeamSection';
import NewJobModalItemsSection from './NewJobModalComponents/NewJobModalItemsSection';
import PricebookModal from './NewJobModalComponents/PricebookModal';
import NewCustomerModal from './NewJobModalComponents/NewCustomerModal';
import { X } from 'lucide-react';
import { AxiosResponse } from 'axios';

interface INewJobModal {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (job: TAddJob) => Promise<AxiosResponse<any, any>>;
  fetchJobs: () => Promise<void>;
}

const NewJobModal = ({
  isOpen,
  onClose,
  onCreate,
  fetchJobs,
}: INewJobModal) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<
    'customer' | 'details' | 'schedule' | 'team' | 'items'
  >('customer');
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<TCustomer>();
  const [selectedProperty, setSelectedProperty] = useState<TProperty>();
  const [selectedLineItems, setSelectedLineItems] = useState<TModalLineItem[]>(
    []
  );
  const [newJob, setNewJob] = useState<TAddJob>(addJobInitialState);
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isPricebookModalOpen, setIsPricebookModalOpen] = useState(false);

  const fetchCustomers = async () => {
    const response = await GetAllCustomers();
    if (response.status === 200) {
      setCustomers(response.data.payload);
    }
  };

  const fetchEmployees = async () => {
    const response = await GetEmployeesByWorkspace(
      user?.workspace.id as string
    );
    if (response) {
      setEmployees(response.data.payload);
    }
    console.log(response);
  };

  // const filteredCustomers = useMemo(() => {
  //   return customers.filter(
  //     (customer) =>
  //       customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       customer.customerPhones[0]?.phoneNumber.includes(searchTerm) ||
  //       customer.email[0]?.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [customers, searchTerm]);

  // const handleRemoveLineItem = (id: string) => {
  //   setNewJob((prev) => ({
  //     ...prev,
  //     lineItems: prev.lineItems.filter((item) => item.lineItemId !== id),
  //   }));
  // };

  // const handleEmployeeToggle = (employee: Employee) => {
  //   setJobDetails((prev) => {
  //     const isAssigned = prev.assignedEmployees.some(
  //       (e) => e.id === employee.id
  //     );
  //     return {
  //       ...prev,
  //       assignedEmployees: isAssigned
  //         ? prev.assignedEmployees.filter((e) => e.id !== employee.id)
  //         : [...prev.assignedEmployees, employee],
  //     };
  //   });
  // };

  const handleCreateJob = async () => {
    const startTimeConvertedToDateTime = `${newJob.startDate}T${newJob.arrivalWindowStart}`;
    const ArrivalWindowStartConvertedToDateTime = `${newJob.startDate}T${newJob.arrivalWindowStart}`;
    const ArrivalWindowEndConvertedToDateTime = `${newJob.startDate}T${newJob.arrivalWindowEnd}`;

    const toJobLineItems = selectedLineItems.map((item) => ({
      serviceItemId: item.serviceItemId,
      quantity: item.quantity,
    }));

    const updatedJob = {
      ...newJob,
      startTime: startTimeConvertedToDateTime,
      arrivalWindowStart: ArrivalWindowStartConvertedToDateTime,
      arrivalWindowEnd: ArrivalWindowEndConvertedToDateTime,
      lineItems: toJobLineItems,
      timeZone,
      createdBy: user?.id,
    };
    console.log(updatedJob);

    const response = await onCreate(updatedJob);
    if (response.status === 200) {
      await fetchJobs();
      onClose();
      setNewJob(addJobInitialState);
      setSelectedLineItems([]);
      setSelectedCustomer(undefined);
      setSelectedProperty(undefined);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-800'>Create New Job</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 cursor-pointer'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Progress Steps */}
        <div className='border-b border-gray-200 px-6 py-3'>
          <div className='flex justify-between'>
            {['customer', 'details', 'schedule', 'team', 'items'].map(
              (step) => (
                <button
                  key={step}
                  onClick={() => setActiveSection(step)}
                  className={`flex flex-col items-center ${
                    activeSection === step ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full mb-1 ${
                      activeSection === step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span className='text-xs font-medium capitalize'>{step}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeSection === 'customer' && (
            <NewJobModalCustomerSection
              customers={customers}
              setNewJob={setNewJob}
              setIsNewCustomerModalOpen={setIsNewCustomerModalOpen}
              setSelectedCustomer={setSelectedCustomer}
              setSelectedProperty={setSelectedProperty}
              setActiveSection={setActiveSection}
            />
          )}

          {activeSection === 'details' && (
            <NewJobModalDetailsSection
              newJob={newJob}
              setNewJob={setNewJob}
              selectedCustomer={selectedCustomer}
              selectedProperty={selectedProperty}
            />
          )}

          {activeSection === 'schedule' && (
            <NewJobModalScheduleSection newJob={newJob} setNewJob={setNewJob} />
          )}

          {activeSection === 'team' && (
            <NewJobModalTeamSection newJob={newJob} employees={employees} />
          )}

          {activeSection === 'items' && (
            <NewJobModalItemsSection
              newJob={newJob}
              setNewJob={setNewJob}
              setIsPricebookModalOpen={setIsPricebookModalOpen}
              selectedLineItems={selectedLineItems}
              setSelectedLineItems={setSelectedLineItems}
            />
          )}
        </div>

        {/* Footer with sticky actions */}
        <div className='border-t border-gray-200 bg-white sticky bottom-0 p-4'>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log(newJob);
              }}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Save Draft
            </button>
            <button
              onClick={handleCreateJob}
              // disabled={
              //   // !newJob.customer ||
              //   // !newJob.property ||
              //   newJob.lineItems.length === 0
              // }
              className={`px-6 py-2 rounded-md text-sm font-medium text-white bg-bg-primary cursor-pointer`}
            >
              Create Job
            </button>
          </div>
        </div>
      </div>

      {/* Pricebook Modal */}
      {isPricebookModalOpen && (
        <PricebookModal
          setNewJob={setNewJob}
          setIsPricebookModalOpen={setIsPricebookModalOpen}
          setSelectedLineItems={setSelectedLineItems}
        />
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <NewCustomerModal
          setIsNewCustomerModalOpen={setIsNewCustomerModalOpen}
        />
      )}
    </div>
  );
};
export default NewJobModal;
