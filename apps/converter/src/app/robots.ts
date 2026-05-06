import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Conversion routes return per-request artifacts and have no
        // canonical SEO value; saves crawl budget on the format-pair
        // endpoints (which all return file blobs anyway).
        disallow: ["/api/", "/pro/", "/_next/"],
      },
    ],
    sitemap: "https://converter.hive.baby/sitemap.xml",
    host: "https://converter.hive.baby",
  };
}
