import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryPlaceholder(category: string): string {
  const c = category?.toLowerCase() || "";
  
  if (c.includes("berber")) 
    return "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop";
  if (c.includes("güzellik") || c.includes("beauty")) 
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop";
  if (c.includes("spa") || c.includes("wellness")) 
    return "https://images.unsplash.com/photo-1544161515-4af6b1d46cc7?w=800&auto=format&fit=crop";
  if (c.includes("diş") || c.includes("clinic") || c.includes("klinik")) 
    return "https://images.unsplash.com/photo-1629909613654-28a3a7c4d45e?w=800&auto=format&fit=crop";
  if (c.includes("kuaför") || c.includes("hair")) 
    return "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop";
  if (c.includes("vet") || c.includes("hayvan")) 
    return "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&auto=format&fit=crop";
    
  return "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop"; // Default to hairdressing/general salon
}

export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function hexToHsl(hex: string | null | undefined): string {
  if (!hex) return "0 0% 0%"; // Default to black or something safe
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
