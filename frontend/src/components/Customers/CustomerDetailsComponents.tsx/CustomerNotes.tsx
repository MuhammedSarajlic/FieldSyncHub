import NoteFileUpload from '../../Notes/NoteFileUpload';
import Note from '../../Notes/Note';
import icons from '../../../constants/icons';

const CustomerNotes = () => {
  return (
    <div className='p-4 border-[1px] border-border-primary rounded-lg bg-[#FAFAFA] space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img src={icons.noteIcon} alt='tag' className='w-5 h-5' />
          <p className='font-semibold text-xl'>Notes</p>
        </div>
        <div>
          <button
            className={`flex bg-bg-primary rounded-lg py-1.5 px-4 cursor-pointer hover:bg-bg-primary-hover transition-colors duration-200`}
          >
            <p className={`text-sm font-semibold text-white `}>New note</p>
          </button>
        </div>
      </div>
      <div>
        <textarea
          placeholder='Note details'
          className='p-3 min-h-[100px] w-full bg-white text-sm text-heading border-[1px] border-border-primary rounded-lg outline-none'
        ></textarea>

        <NoteFileUpload />
      </div>
      <Note />
      <Note />
    </div>
  );
};

export default CustomerNotes;
