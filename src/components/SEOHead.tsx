import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

export function SEOHead({ title, description, url, image, type = "website", jsonLd }: SEOHeadProps) {
  const siteName = "RandevuDunyasi";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Türkiye'nin Randevu Platformu`;
  const desc = description || "Berber, güzellik salonu, spa ve diş kliniği randevularınızı kolayca alın. Türkiye genelinde binlerce işletme.";

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:type", type);
    if (url) setMeta("og:url", url);
    if (image) setMeta("og:image", image);
    setMeta("og:site_name", siteName);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    if (image) setMeta("twitter:image", image);
    setMeta("google-site-verification", "FvEfSPMfEfB3mM78gk4bndaX8xxO9oXoAapS_a_SG3c");

    // JSON-LD
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    if (existingScript) existingScript.remove();
    
    // Default Schema for the platform
    const defaultJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Randevu Dünyası",
      "url": "https://randevudunyasi.com/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://randevudunyasi.com/isletmeler?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
    
    const finalJsonLd = jsonLd ? (Array.isArray(jsonLd) ? [defaultJsonLd, ...jsonLd] : [defaultJsonLd, jsonLd]) : defaultJsonLd;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(finalJsonLd);
    document.head.appendChild(script);

    return () => {
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [fullTitle, desc, url, image, type, jsonLd]);

  return null;
}