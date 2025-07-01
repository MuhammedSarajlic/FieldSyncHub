// firebase/uploadFileWithProgress.ts
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

interface UploadResult {
  progress?: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  downloadURL?: string;
  error?: string;
}

export const uploadFileWithProgress = (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResult> => {
  return new Promise((resolve) => {
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `service-item-images/${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        resolve({ progress: 0, status: 'Failed', error: error.message });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ progress: 100, status: 'Completed', downloadURL });
        } catch (downloadError: any) {
          console.error('Failed to get download URL:', downloadError);
          resolve({
            progress: 100,
            status: 'Failed',
            error: downloadError.message,
          });
        }
      }
    );
  });
};
