import NoteFileUpload from '../../Notes/NoteFileUpload';
import Note from '../../Notes/Note';
import { TAddNote, TNote } from '../../../types/Note';
import { useState } from 'react';
import { addNoteInitialState } from '../../../const/states';
import { CreateNote } from '../../../services/Notes';
import { useAuth } from '../../../context/AuthProvider';

interface ICustomerNotes {
  notes: TNote[];
  customerId: string;
}

const CustomerNotes = ({ notes, customerId }: ICustomerNotes) => {
  const { user } = useAuth();
  const [notesList, setNotesList] = useState<TNote[]>(notes);
  const [isAddNote, setIsAddNote] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<TAddNote>(addNoteInitialState);

  const handleAddNote = async () => {
    if (!user) return;
    const updatedNote = {
      ...newNote,
      createdBy: user.id,
      createdByName: user.fullName,
      createdAt: new Date().toISOString(),
      customerId: customerId,
    };

    const response = await CreateNote(updatedNote);
    if (response.status === 200) {
      setIsAddNote(false);
      setNewNote(addNoteInitialState);
      setNotesList((prevNotes) => [response.data, ...prevNotes]);
    }
  };

  return (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-white rounded-lg shadow-xs'>
            <svg
              className='w-5 h-5 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <p className='font-semibold text-lg text-gray-800'>Notes</p>
        </div>
        {!isAddNote && (
          <button
            onClick={() => setIsAddNote(true)}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200'
          >
            + New Note
          </button>
        )}
      </div>

      {isAddNote && (
        <div className='space-y-3'>
          <textarea
            placeholder='Enter note details...'
            value={newNote.noteText}
            onChange={(e) =>
              setNewNote({ ...newNote, noteText: e.target.value })
            }
            className='p-3 min-h-[100px] w-full bg-white text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
          />
          <NoteFileUpload />
          <div className='flex items-center justify-end space-x-3 pt-2'>
            <button
              onClick={() => setIsAddNote(false)}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {notesList && notesList.length > 0 ? (
        <div className='space-y-3'>
          {notesList.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </div>
      ) : (
        !isAddNote && (
          <div className='py-6 text-center bg-white rounded-lg border border-dashed border-gray-300'>
            <svg
              className='mx-auto h-10 w-10 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1'
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-700'>
              No notes yet
            </h3>
            <p className='mt-1 text-xs text-gray-500'>
              Add your first note to get started
            </p>
            <button
              onClick={() => setIsAddNote(true)}
              className='mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200'
            >
              + Add Note
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default CustomerNotes;
