import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
}

export function SEOHead({ 
  title, 
  description, 
  url, 
  image = "/logo.png", 
  type = "website", 
  jsonLd,
  noindex = false
}: SEOHeadProps) {
  const siteName = "RandevuDunyasi";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Türkiye'nin Randevu Platformu`;
  const desc = description || "Berber, güzellik salonu, spa ve diş kliniği randevularınızı kolayca alın. Türkiye genelinde binlerce işletme.";
  
  const currentUrl = url || typeof window !== 'undefined' ? window.location.href : '';

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
  
  const finalJsonLd = jsonLd 
    ? (Array.isArray(jsonLd) ? [defaultJsonLd, ...jsonLd] : [defaultJsonLd, jsonLd]) 
    : defaultJsonLd;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      
      {/* Search Engine Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={currentUrl} />

      {/* Social - Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="tr_TR" />

      {/* Social - Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@RandevuDunyasi" />

      {/* Verification */}
      <meta name="google-site-verification" content="FvEfSPMfEfB3mM78gk4bndaX8xxO9oXoAapS_a_SG3c" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
}