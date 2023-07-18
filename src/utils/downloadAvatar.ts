import type { SupabaseClient } from '@supabase/supabase-js';


export default async (path: string, supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase.storage.from('avatars').download(path);

    if (error) {
      throw error;
    }

    const url = URL.createObjectURL(data);

    return url;
  } catch (error) {
    console.log('Error downloading image:', error);
    return '';
  }
}
