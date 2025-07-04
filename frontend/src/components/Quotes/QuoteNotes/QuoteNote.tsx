import { DateTime } from 'luxon';
import { TNote } from '../../../types/Note';
import { MoreVertical, Paperclip } from 'lucide-react';

interface IQuoteNote {
  note: TNote;
}

const QuoteNote = ({ note }: IQuoteNote) => {
  const localDate = DateTime.fromISO(note.createdAt, {
    zone: 'utc',
  }).toLocal();
  const formattedDate = localDate.toFormat('MMM dd, yyyy • h:mm a');
  return (
    <div key={note.id} className=''>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div className='flex-shrink-0 text-sm flex items-center justify-center w-8 h-8 rounded-full bg-bg-primary text-white font-medium'>
              {note.createdByName.charAt(0)}
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
            <MoreVertical className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteNote;
