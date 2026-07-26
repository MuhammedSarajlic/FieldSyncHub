import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. File uploads will fail until these are set in frontend/.env.'
  );
}

// createClient() throws immediately on an invalid/empty URL, which would
// crash every page that transitively imports an upload helper. Fall back to
// a syntactically-valid placeholder so only actual upload attempts fail
// (with the console.error above already flagging the real cause) until real
// Supabase credentials are set.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// All uploads live in one public bucket, organized by folder prefix
// (e.g. "notes/172839_file.pdf"), mirroring the previous Firebase layout.
export const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'uploads';
