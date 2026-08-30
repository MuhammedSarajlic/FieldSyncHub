import { uploadWithProgress } from './upload';

export interface UploadStatus {
  progress: number;
  status: 'Pending' | 'Uploading' | 'Completed' | 'Failed';
  // Despite the name, this is the storage path, not a URL - see uploadToBackend.
  downloadURL?: string;
  error?: string;
}

// folderName used to control the object's path directly (client-chosen, no
// validation). Categories are fixed server-side now - this is the only caller
// (quote attachments), kept as a no-op parameter so it doesn't need to change.
export const uploadFileToStorage = async (
  file: File,
  _folderName: string,
  onProgress: (progress: number) => void
): Promise<UploadStatus> => {
  return uploadWithProgress(file, 'quote-attachment', onProgress);
};
