import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return [
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/register`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
