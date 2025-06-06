import { TNote } from '../../types/Note';
import { DateTime } from 'luxon';
import { Paperclip, MoreVertical, Pin } from 'lucide-react';

interface INote {
  note: TNote;
}

const Note = ({ note }: INote) => {
  const localDate = DateTime.fromISO(note.createdAt, { zone: 'utc' }).toLocal();
  const formattedDate = localDate.toFormat('MMM dd, yyyy • h:mm a');
  const userInitials = note.createdByName
    ? note.createdByName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'US';

  return (
    <div className='p-5 bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-shadow duration-200 group'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div className='bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center text-white font-medium text-sm'>
              {userInitials.slice(0, 2)}
            </div>
          </div>
          <div className='space-y-1.5'>
            <div className='flex items-center space-x-2'>
              <p className='text-sm font-semibold text-gray-900'>
                {note.createdByName || 'Unknown User'}
              </p>
              <span className='inline-block w-1 h-1 rounded-full bg-gray-400'></span>
              <p className='text-xs text-gray-500'>{formattedDate}</p>
            </div>
            <p className='text-sm text-gray-700 leading-relaxed'>
              {note.noteText}
            </p>

            {note.pathFile && (
              <div className='pt-1.5'>
                <a
                  href={note.pathFile}
                  className='inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline'
                  download
                >
                  <Paperclip className='w-4 h-4 mr-1.5' />
                  Download Attachment
                </a>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button className='text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100'>
            <Pin className='w-4 h-4' />
          </button>
          <button className='text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100'>
            <MoreVertical className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Note;
