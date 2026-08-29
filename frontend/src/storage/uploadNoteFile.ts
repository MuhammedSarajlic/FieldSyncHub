import { uploadToBackend } from '../services/Upload';

export interface UploadStatus {
  progress: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  // Despite the name, this is the storage path, not a URL - it's what gets
  // persisted as Note.pathFile. The note the server hands back after CreateNote
  // already carries a real signed URL for immediate display.
  downloadURL?: string;
  error?: string;
}

export const uploadNoteFile = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadStatus> => {
  onProgress(0);
  try {
    const result = await uploadToBackend(file, 'note');
    onProgress(100);
    return { progress: 100, status: 'Completed', downloadURL: result.path };
  } catch (error) {
    return {
      progress: 0,
      status: 'Failed',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};
