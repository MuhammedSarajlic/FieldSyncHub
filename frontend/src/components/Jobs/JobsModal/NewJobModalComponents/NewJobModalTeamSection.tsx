import { X } from 'lucide-react';
import { TEmployee } from '../../../../types/Employee';
import { TAddJob } from '../../../../types/Job';

interface INewJobModalTeamSection {
  newJob: TAddJob;
  employees: TEmployee[];
}
const NewJobModalTeamSection = ({
  newJob,
  employees,
}: INewJobModalTeamSection) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Assign Team</h3>
        <p className='text-sm text-gray-500'>Select technicians for this job</p>
      </div>

      <div className='space-y-4'>
        {newJob.assignedTeamMemberIds &&
          newJob.assignedTeamMemberIds.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {/* {jobDetails.assignedEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className='flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                      >
                        {employee.name}
                        <button
                          onClick={() => handleEmployeeToggle(employee)}
                          className='ml-2 text-blue-600 hover:text-blue-800'
                        > */}
              {/* <X className='h-4 w-4' /> */}
              {/* </button>
                      </div>
                    ))} */}
            </div>
          )}

        <div className='space-y-2'>
          {employees.map((employee) => (
            <div
              key={employee.id}
              // onClick={() => handleEmployeeToggle(employee)}
              className={`p-3 border border-gray-200 rounded-lg cursor-pointer flex items-center justify-between 
                        `}
              //   ${
              //   jobDetails.assignedEmployees.some(
              //     (e) => e.id === employee.id
              //   )
              //     ? 'border-blue-500 bg-blue-50'
              //     : 'border-gray-200 hover:bg-gray-50'
              // }
            >
              <div className='flex items-center'>
                <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3'>
                  {employee.user.firstName.charAt(0)}
                </div>
                <div>
                  <h4 className='font-medium'>
                    {employee.user.firstName} {employee.user.lastName}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    {employee.position ?? 'Technician'}
                  </p>
                </div>
              </div>
              <input
                type='checkbox'
                // checked={jobDetails.assignedEmployees.some(
                //   (e) => e.id === employee.id
                // )}
                onChange={() => {}}
                className='h-4 w-4 text-blue-600'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewJobModalTeamSection;
