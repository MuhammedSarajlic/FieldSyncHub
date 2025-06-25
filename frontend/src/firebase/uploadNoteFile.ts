import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

export interface UploadStatus {
  progress: number;
  status: 'Uploading' | 'Completed' | 'Failed';
  downloadURL?: string;
  error?: string;
}

export const uploadNoteFile = (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadStatus> => {
  return new Promise((resolve) => {
    const storage = getStorage();
    const storageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        resolve({ progress: 0, status: 'Failed', error: error.message });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ progress: 100, status: 'Completed', downloadURL });
      }
    );
  });
};
