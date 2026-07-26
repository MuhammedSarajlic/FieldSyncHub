import { supabase, STORAGE_BUCKET } from './supabaseClient';

export const uploadFile = async (file: File): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const path = `uploads/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return publicUrl;
};
