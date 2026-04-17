import { supabase } from "./supabase";

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param bucket Bucket name (e.g. 'business-assets')
 * @param path File path inside bucket (e.g. 'logos/business_id.png')
 * @param file File object from input
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  try {
    // 1. Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
}

/**
 * Handles business asset uploads (logo, cover, portfolio)
 */
export async function uploadBusinessAsset(businessId: string, folder: 'logos' | 'covers' | 'portfolio', file: File) {
  const extension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const path = `${businessId}/${folder}/${fileName}`;
  
  return uploadFile('business-assets', path, file);
}
