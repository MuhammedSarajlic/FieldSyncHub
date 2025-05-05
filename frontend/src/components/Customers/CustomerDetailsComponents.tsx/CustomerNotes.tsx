import NoteFileUpload from '../../Notes/NoteFileUpload';
import Note from '../../Notes/Note';
import icons from '../../../constants/icons';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import { TAddNote, TNote } from '../../../types/Note';
import { useEffect, useState } from 'react';
import CustomButton from '../../CustomElements/CustomButton';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import { initialNoteState } from '../../../const/states';
import { CreateNote } from '../../../services/Notes';

interface ICustomerNotes {
  notes: TNote[];
  customerId: string;
}

const CustomerNotes = ({ notes, customerId }: ICustomerNotes) => {
  const [isAddNote, setIsAddNote] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<TAddNote>(initialNoteState);

  useEffect(() => {
    setNewNote({ ...newNote, customerId: customerId });
  }, [customerId]);

  const handleAddNote = async () => {
    const updatedNote = { ...newNote, createdAt: new Date().toISOString() };
    const response = await CreateNote(updatedNote);
    console.log(response);
  };

  return (
    <div className='p-4 border-[1px] border-border-primary rounded-lg bg-[#FAFAFA] space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {/* <img src={icons.noteIcon} alt='tag' className='w-5 h-5' /> */}
          <p className='font-semibold text-xl'>Notes</p>
        </div>
        {!isAddNote && (
          <CustomSmallButton
            title='New note'
            customStyle='px-4 border-transparent bg-bg-primary hover:bg-bg-primary-hover'
            customTextStyle='text-white'
            handleClick={() => setIsAddNote(true)}
          />
        )}
      </div>
      {isAddNote && (
        <div>
          <textarea
            placeholder='Note details'
            value={newNote.noteText}
            onChange={(e) =>
              setNewNote({ ...newNote, noteText: e.target.value })
            }
            className='p-3 min-h-[100px] w-full bg-white text-sm text-heading border-[1px] border-border-primary rounded-lg outline-none'
          ></textarea>

          <NoteFileUpload />
          <div className='mt-4 flex items-center justify-end space-x-2'>
            <ButtonIcon
              name='Cancel'
              handleBtnClick={() => setIsAddNote(false)}
            />
            <CustomButton title='Save' handleBtnClick={handleAddNote} />
          </div>
        </div>
      )}
      {notes && notes.length > 0 ? (
        notes.map((note) => <Note key={note.id} note={note} />)
      ) : (
        <div className='flex items-center space-x-3'>
          <div className='bg-white p-4 rounded-full flex items-center justify-center'>
            <img src={icons.noteIcon} alt='office' className='w-5 h-5' />
          </div>
          <div>
            <p className='font-bold text-heading'>No notes</p>
            <p className='text-primary text-sm'>
              No notes have been added for this customer yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerNotes;
