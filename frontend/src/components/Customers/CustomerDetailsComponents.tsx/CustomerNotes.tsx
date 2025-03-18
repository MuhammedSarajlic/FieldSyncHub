import NoteFileUpload from '../../Notes/NoteFileUpload';
import Note from '../../Notes/Note';
import icons from '../../../constants/icons';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';

const CustomerNotes = () => {
  return (
    <div className='p-4 border-[1px] border-border-primary rounded-lg bg-[#FAFAFA] space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img src={icons.noteIcon} alt='tag' className='w-5 h-5' />
          <p className='font-semibold text-xl'>Notes</p>
        </div>
        <CustomSmallButton
          title='New note'
          customStyle='px-4 border-transparent bg-bg-primary hover:bg-bg-primary-hover'
          customTextStyle='text-white'
        />
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
