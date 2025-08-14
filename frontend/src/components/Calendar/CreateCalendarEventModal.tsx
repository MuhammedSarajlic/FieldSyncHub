import { Briefcase, CalendarIcon, ClipboardCheck } from 'lucide-react';
import { forwardRef } from 'react';

interface ICreateCalendarEventModal {
  isOpen: boolean;
  createCalendarEventModalPosition: { x: number; y: number };
  onClose: () => void;
  setIsCreateEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateCalendarEventModal = forwardRef<
  HTMLDivElement,
  ICreateCalendarEventModal
>(
  (
    {
      isOpen,
      createCalendarEventModalPosition,
      onClose,
      setIsCreateEventModalOpen,
    },
    ref
  ) => {
    if (!isOpen) return null;
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        ref={ref}
        style={{
          top: createCalendarEventModalPosition.y,
          left: createCalendarEventModalPosition.x,
        }}
        className={`min-w-[200px] bg-white shadow-xl rounded-md absolute overflow-hidden`}
      >
        <div className='px-2 py-1.5 text-sm font-semibold bg-bg-primary/30'>
          Create...
        </div>
        <div className='p-2'>
          <ul>
            <li className='p-2 flex items-center space-x-2 text-text-primary font-semibold rounded-md hover:bg-bg-primary/20 cursor-pointer'>
              <Briefcase className='w-5.5 h-5.5' />
              <p className='text-sm'>Job</p>
            </li>
            <li className='p-2 flex items-center space-x-2 text-text-primary font-semibold rounded-md hover:bg-bg-primary/20 cursor-pointer'>
              <ClipboardCheck className='w-5.5 h-5.5' />
              <p className='text-sm'>Lead</p>
            </li>
            <li
              onClick={() => {
                setIsCreateEventModalOpen(true);
                onClose();
              }}
              className='p-2 flex items-center space-x-2 text-text-primary font-semibold rounded-md hover:bg-bg-primary/20 cursor-pointer'
            >
              <CalendarIcon className='w-5.5 h-5.5' />
              <p className='text-sm'>Event</p>
            </li>
          </ul>
        </div>
      </div>
    );
  }
);

export default CreateCalendarEventModal;
