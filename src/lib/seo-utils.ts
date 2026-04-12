export const generateSitemap = async (businesses: any[]) => {
  const baseUrl = "https://businessconnecthub.com"; // Adjust to your domain
  const staticPages = ["", "/kesfet", "/kayit", "/giris"];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static Pages
  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  // Business Detail Pages
  businesses.forEach(biz => {
    sitemap += `
  <url>
    <loc>${baseUrl}/isletme/${biz.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `\n</urlset>`;
  return sitemap;
};
