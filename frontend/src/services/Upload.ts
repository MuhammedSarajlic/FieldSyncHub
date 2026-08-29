import api from './api';

// Must match the categories UploadController recognizes (backend/Services/StorageService/UploadPolicy.cs) -
// each has its own server-side size/type rules, so there's nothing else for the client to configure.
export type UploadCategory =
  | 'logo'
  | 'note'
  | 'quote-attachment'
  | 'service-item-image';

export interface BackendUploadResult {
  // The stored object's path - this is what must be persisted (as logoUrl,
  // pathFile, imageUrl, or an attachment url), never the signed url below.
  path: string;
  // A short-lived signed URL for immediate use (e.g. showing what was just
  // uploaded) - it expires, so it's never what gets saved.
  url: string;
}

export async function uploadToBackend(
  file: File,
  category: UploadCategory
): Promise<BackendUploadResult> {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('file', file);

  const response = await api.post<BackendUploadResult>('/upload', formData);
  return response.data;
}

export async function getSignedUrl(path: string): Promise<string> {
  const response = await api.get<{ url: string }>('/upload/signed-url', {
    params: { path },
  });
  return response.data.url;
}
