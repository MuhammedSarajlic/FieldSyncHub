import { supabase, STORAGE_BUCKET } from './supabaseClient';

interface UploadResult {
  progress?: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  downloadURL?: string;
  error?: string;
}

// Note: the Supabase JS client's upload() does not expose fine-grained
// progress events the way Firebase's uploadBytesResumable did, so this
// reports 0 -> 100 rather than incremental percentages.
export const uploadFileWithProgress = (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResult> => {
  return new Promise((resolve) => {
    onProgress(0);
    const path = `service-item-images/${Date.now()}_${file.name}`;

    supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file)
      .then(({ error }) => {
        if (error) {
          console.error('Upload failed:', error);
          resolve({ progress: 0, status: 'Failed', error: error.message });
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        onProgress(100);
        resolve({ progress: 100, status: 'Completed', downloadURL: publicUrl });
      });
  });
};
