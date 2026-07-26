import { supabase, STORAGE_BUCKET } from './supabaseClient';

export interface UploadStatus {
  progress: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  downloadURL?: string;
  error?: string;
}

// Note: no fine-grained progress from the Supabase client (see
// uploadFileWithProgress.ts) — reports 0 -> 100 rather than incremental %.
export const uploadNoteFile = (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadStatus> => {
  return new Promise((resolve) => {
    onProgress(0);
    const path = `notes/${Date.now()}_${file.name}`;

    supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file)
      .then(({ error }) => {
        if (error) {
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
