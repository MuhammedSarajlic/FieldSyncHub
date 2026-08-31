import { DateTime } from 'luxon';
import { Paperclip } from 'lucide-react';
import { TNote } from '../../../types/Note';

const QuoteNote = ({ note }: { note: TNote }) => {
  const localDate = DateTime.fromISO(note.createdAt, { zone: 'utc' }).toLocal();
  const formattedDate = localDate.isValid ? localDate.toFormat('MMM dd, yyyy • h:mm a') : 'Date unavailable';

  return (
    <article className='flex items-start gap-3'>
      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6eeea] text-xs font-bold text-[#24533f]'>
        {(note.createdByName || '?').charAt(0).toUpperCase()}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
          <p className='text-sm font-semibold text-[#24332c]'>{note.createdByName || 'Unknown user'}</p>
          <time dateTime={note.createdAt} className='text-xs text-[#5f6d66]'>{formattedDate}</time>
        </div>
        <p className='mt-1 whitespace-pre-wrap text-sm leading-6 text-[#46564e]'>{note.noteText}</p>
        {note.pathFile && <a href={note.pathFile} className='mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0d5944] hover:underline' download><Paperclip className='h-4 w-4' /> Download attachment</a>}
      </div>
    </article>
  );
};

export default QuoteNote;
