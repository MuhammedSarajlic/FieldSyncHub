import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import IconButton from '../../CustomElements/Buttons/IconButton';
import Modal from '../../CustomElements/Modal';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  actionType: 'delete' | 'archive';
  itemType?: string;
}

const ActionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  actionType,
  itemType = 'item',
}: ActionConfirmationModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      setConfirmation('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Configuration based on action type
  const config = {
    delete: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonText: 'Delete',
      actionIcon: Trash2,
      title: `Delete ${itemType}`,
      description: `Are you sure you want to permanently delete ${itemType}`,
      bulletPoints: [
        'All associated data will be permanently removed',
        'This action cannot be reversed',
        'Any related records will also be affected',
      ],
    },
    archive: {
      icon: Archive,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      buttonText: 'Archive',
      actionIcon: Archive,
      title: `Archive ${itemType}`,
      description: `Are you sure you want to archive ${itemType}`,
      bulletPoints: [
        `The ${itemType} will be marked as inactive`,
        'All historical data will be preserved',
        `It will be removed from active ${itemType} lists`,
      ],
    },
  };

  const {
    icon: Icon,
    iconBg,
    iconColor,
    buttonBg,
    buttonText,
    actionIcon: ActionIcon,
    title,
    description,
    bulletPoints,
  } = config[actionType];
  const requiresTypedConfirmation = actionType === 'delete';

  return (
    <Modal open={isOpen} onClose={onClose} title={title} labelledBy='action-confirmation-title' className='max-w-md'>
      <div>
        <div className='p-6'>
          <div className='flex items-start'>
            <div
              className={`flex-shrink-0 h-10 w-10 rounded-full ${iconBg} flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className='ml-4'>
              <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  {description}{' '}
                  <span className='font-semibold text-gray-800'>
                    {itemName}
                  </span>
                  ?{actionType === 'delete' && ' This action will:'}
                </p>
                {bulletPoints.length > 0 && (
                  <ul className='list-disc text-sm text-gray-500 pl-5 mt-2 space-y-1'>
                    {bulletPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
                {requiresTypedConfirmation && (
                  <div className='mt-4'>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Type DELETE to confirm
                    </label>
                    <input
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      autoComplete='off'
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <CustomButton
              onClick={onClose}
              disabled={
                isProcessing ||
                (requiresTypedConfirmation && confirmation !== 'DELETE')
              }
              customStyle='px-4 py-2 border-gray-300  hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <IconButton
              icon={<ActionIcon className='w-4 h-4 mr-2' />}
              onClick={handleAction}
              disabled={isProcessing}
              customStyle={`px-4 py-2 ${buttonBg} text-white border-transparent disabled:opacity-50 focus:outline-none`}
            >
              {isProcessing ? `${buttonText}...` : `${buttonText} ${itemType}`}
            </IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ActionConfirmationModal;
