import { Search, Plus } from 'lucide-react';

interface ITableEmptyState {
  title?: string;
  description?: string;
  showIcon?: boolean;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
  icon?: any;
  variant?: string;
}

const TableEmptyState = ({
  title = 'No results found',
  description = 'Try adjusting your filters or create a new item',
  showIcon = true,
  showCreateButton = true,
  onCreateClick,
  createButtonText = 'Create New',
  icon: CustomIcon = Search,
  variant = 'default', // "default", "search", "create"
}: ITableEmptyState) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return {
          container: 'py-12 px-6',
          iconWrapper: 'w-16 h-16 bg-blue-50 text-blue-400',
          title: 'text-gray-700 text-lg font-medium',
          description: 'text-gray-500',
        };
      case 'create':
        return {
          container: 'py-16 px-6',
          iconWrapper: 'w-20 h-20 bg-green-50 text-green-400',
          title: 'text-gray-800 text-xl font-semibold',
          description: 'text-gray-600',
        };
      default:
        return {
          container: 'py-10 px-6',
          iconWrapper: 'w-14 h-14 bg-gray-50 text-gray-400',
          title: 'text-gray-600 text-base font-medium',
          description: 'text-gray-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`text-center ${styles.container}`}>
      {showIcon && (
        <div className='flex justify-center mb-4'>
          <div
            className={`${styles.iconWrapper} rounded-full flex items-center justify-center transition-colors duration-200`}
          >
            <CustomIcon size={variant === 'create' ? 32 : 24} />
          </div>
        </div>
      )}

      <h3 className={`${styles.title} mb-2`}>{title}</h3>

      <p
        className={`${styles.description} text-sm mb-6 max-w-md mx-auto leading-relaxed`}
      >
        {description}
      </p>

      {showCreateButton && onCreateClick && (
        <button
          onClick={onCreateClick}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          <Plus size={16} />
          {createButtonText}
        </button>
      )}
    </div>
  );
};

export default TableEmptyState;
