import type { MetadataRoute } from "next";
import { navigation } from "@/content/site";
import { siteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...navigation.map((n) => n.href), "/join"].map((path) => ({ url: `${siteUrl}${path}` }));
}
