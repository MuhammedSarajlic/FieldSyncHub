import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

export interface UploadStatus {
  progress: number;
  status: 'Pending' | 'Uploading' | 'Completed' | 'Failed';
  downloadURL?: string;
  error?: string;
}

export const uploadFileToFirebase = (
  file: File,
  folderName: string,
  onProgress: (progress: number) => void
): Promise<UploadStatus> => {
  return new Promise((resolve) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${folderName}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error(
          `Firebase upload failed for ${file.name} in folder ${folderName}:`,
          error
        );
        resolve({ progress: 0, status: 'Failed', error: error.message });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ progress: 100, status: 'Completed', downloadURL });
        } catch (urlError: any) {
          console.error(
            `Failed to get download URL for ${file.name}:`,
            urlError
          );
          resolve({ progress: 100, status: 'Failed', error: urlError.message });
        }
      }
    );
  });
};
