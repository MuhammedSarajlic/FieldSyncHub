import { uploadToBackend } from '../services/Upload';

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
  onProgress(0);
  try {
    const result = await uploadToBackend(file, 'quote-attachment');
    onProgress(100);
    return { progress: 100, status: 'Completed', downloadURL: result.path };
  } catch (error) {
    console.error(`Storage upload failed for ${file.name}:`, error);
    return {
      progress: 0,
      status: 'Failed',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};
