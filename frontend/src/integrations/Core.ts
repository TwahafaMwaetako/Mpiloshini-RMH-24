import { supabase } from '@/services/supabaseClient'

export async function UploadFile({ file }: { file: File }): Promise<{ file_url: string; file_path: string }> {
  const bucket = 'vibration-files'
  const path = `uploads/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { file_url: data.publicUrl, file_path: path }
}


