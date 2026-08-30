import { TAddNote } from '../types/Note';
import api from './api';

export async function CreateNote(note: TAddNote) {
  const response = await api.post('/note', note);
  return response;
}
