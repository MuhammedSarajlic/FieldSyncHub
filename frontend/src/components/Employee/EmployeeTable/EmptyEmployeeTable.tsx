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
      className='bg-white rounded-xl shadow-sm p-12 text-center'
    >
      <div className='mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center'>
        <Users className='h-10 w-10 text-blue-500' />
      </div>
      <h3 className='mt-4 text-lg font-medium text-gray-900'>
        No employees found
      </h3>
      <p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
        No employees match your current filter criteria. Try adjusting your
        search or filters, or invite new team members to your organization.
      </p>
      <div className='mt-6'>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetFilters}
          className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3'
        >
          Clear Filters
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsInviteModalOpen(true)}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          <UserPlus className='h-4 w-4 mr-2' />
          Invite Employee
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmptyEmployeeTable;
