import { uploadToBackend } from '../services/Upload';

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
  onProgress(0);
  try {
    const result = await uploadToBackend(file, 'service-item-image');
    onProgress(100);
    return { progress: 100, status: 'Completed', downloadURL: result.path };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      progress: 0,
      status: 'Failed',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};
