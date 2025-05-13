import icons from '../../constants/icons';
import { TNote } from '../../types/Note';
import { DateTime } from 'luxon';

interface INote {
  note: TNote;
}

const Note = ({ note }: INote) => {
  // Convert the ISO string (UTC date) to a local date in the user's timezone
  const formattedCreatedAt = new Date(note.createdAt).toLocaleString(); // Shows in user's timezone
  const localDate = DateTime.fromISO(note.createdAt, { zone: 'utc' }).toLocal();

  return (
    <div className='p-4 bg-white border-[1px] border-border-primary rounded-lg space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='bg-primary rounded-full w-8 h-8'></div>
          <div>
            <p className='text-sm font-semibold text-heading'>
              Muhammed Sarajlic
            </p>
            <p className='text-xs text-primary'>
              {`Created: ${localDate.toFormat('yyyy-MM-dd HH:mm')}`}
            </p>
          </div>
        </div>
        <div>
          <img src={icons.pinIcon} alt='pin' className='w-5 h-5' />
        </div>
      </div>
      <div className='py-1'>
        <p className='text-primary text-sm'>{note.noteText}</p>
      </div>
    </div>
  );
};

export default Note;
