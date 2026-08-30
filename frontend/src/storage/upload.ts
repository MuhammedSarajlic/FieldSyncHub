import { uploadToBackend, UploadCategory } from '../services/Upload';

export type UploadState = 'Uploading' | 'Completed' | 'Failed';

export interface UploadWithProgressResult {
  progress: number;
  status: UploadState;
  downloadURL?: string;
  error?: string;
}

export const uploadWithProgress = async (
  file: File,
  category: UploadCategory,
  onProgress: (progress: number) => void
): Promise<UploadWithProgressResult> => {
  onProgress(0);
  try {
    const result = await uploadToBackend(file, category);
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
