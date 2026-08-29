import { uploadToBackend } from '../services/Upload';

// Used for the company logo, uploaded during onboarding (before a workspace
// exists) and again from Settings. Returns the storage path - callers persist
// this directly as logoUrl; the backend resolves it to a real (short-lived,
// signed) URL every time the workspace is fetched.
export const uploadFile = async (file: File): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const result = await uploadToBackend(file, 'logo');
  return result.path;
};
