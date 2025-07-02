import { motion } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import useClearFilters from '../../../hooks/useClearFilters';

interface IEmptyEmployeeTable {
  // resetFilters: () => void;
  setIsInviteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterOptions: any;
}

const EmptyEmployeeTable = ({
  // resetFilters,
  setIsInviteModalOpen,
  filterOptions,
}: IEmptyEmployeeTable) => {
  const { clearFilterURLParams } = useClearFilters();

  const handleResetFilters = () => {
    clearFilterURLParams(filterOptions);
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='bg-white rounded-xl shadow-sm p-20 text-center border border-gray-100'
    >
      <div className='mx-auto h-20 w-20 rounded-full bg-green-50 flex items-center justify-center'>
        <Users className='h-10 w-10 text-bg-primary' />
      </div>
      <h3 className='mt-4 text-lg font-medium text-gray-900'>
        No employees found
      </h3>
      <p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
        No employees match your current filter criteria. Try adjusting your
        search or filters, or invite new team members to your organization.
      </p>
      <div className='mt-6 flex items-center justify-center space-x-3'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetFilters}
          className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium cursor-pointer rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
        >
          Clear Filters
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsInviteModalOpen(true)}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium cursor-pointer rounded-lg shadow-sm text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none'
        >
          <UserPlus className='h-4 w-4 mr-2' />
          Invite Employee
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmptyEmployeeTable;
