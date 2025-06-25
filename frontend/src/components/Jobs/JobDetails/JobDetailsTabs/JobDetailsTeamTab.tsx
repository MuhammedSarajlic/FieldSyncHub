import { Mail, Phone, User } from 'lucide-react';
import { TJob } from '../../../../types/Job';

interface IJobDetailsTeamTab {
  jobDetails: TJob;
}

const JobDetailsTeamTab = ({ jobDetails }: IJobDetailsTeamTab) => {
  return (
    <div>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>
        Assigned Team Members
      </h3>
      <div className='space-y-4'>
        {jobDetails.assignedTeamMembers.map((member) => (
          <div
            key={member.id}
            className='flex items-center p-4 bg-gray-50 rounded-lg'
          >
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
              <User className='w-6 h-6 text-blue-600' />
            </div>
            <div className='ml-4 flex-1'>
              <h4 className='text-sm font-medium text-gray-900'>
                {member.user.fullName}
              </h4>
              <p className='text-sm text-gray-600'>{member.position}</p>
            </div>
            <div className='text-right'>
              <div className='flex items-center text-sm text-gray-600 mb-1'>
                <Phone className='w-4 h-4 mr-2' />
                {member.phoneNumber}
              </div>
              <div className='flex items-center text-sm text-gray-600'>
                <Mail className='w-4 h-4 mr-2' />
                {member.user.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobDetailsTeamTab;
