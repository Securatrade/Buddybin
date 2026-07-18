import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

const publicRoutes = [
  "",
  "/how-it-works",
  "/for-cleaners",
  "/help",
  "/contact",
  "/login",
  "/terms",
  "/privacy",
  "/cookies",
  "/cancellation-policy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();

  return publicRoutes.map((route) => ({
    url: `${url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
