import { uploadWithProgress } from './upload';

interface UploadResult {
  progress?: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  // Despite the name, this is the storage path, not a URL - see uploadToBackend.
  downloadURL?: string;
  error?: string;
}

// Used for pricebook service item images.
export const uploadFileWithProgress = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResult> => {
  return uploadWithProgress(file, 'service-item-image', onProgress);
};
