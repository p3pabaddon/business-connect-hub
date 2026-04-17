import { supabase } from "./supabase";

/**
 * Generates an optimized image URL using Supabase Storage transformations.
 * Requires Supabase Pro/Team for full automation, but works for basic resizing.
 */
export function getOptimizedImageUrl(
  path: string, 
  bucket: string = "business-photos",
  options: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'contain' | 'fill' } = {}
) {
  if (!path) return "/placeholder-business.jpg";
  if (path.startsWith("http")) return path;

  const { width = 800, height, quality = 80, fit = 'cover' } = options;
  
  // Supabase Transformation URL structure
  // https://[project-id].supabase.co/storage/v1/render/image/public/[bucket]/[path]?width=x&height=y&quality=z&resize=fit
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data.publicUrl;
  
  if (publicUrl.includes("localhost") || !publicUrl.includes("supabase.co")) {
    return publicUrl;
  }

  const renderUrl = publicUrl.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const params = new URLSearchParams();
  if (width) params.append("width", width.toString());
  if (height) params.append("height", height.toString());
  params.append("quality", quality.toString());
  params.append("resize", fit);

  return `${renderUrl}?${params.toString()}`;
}
