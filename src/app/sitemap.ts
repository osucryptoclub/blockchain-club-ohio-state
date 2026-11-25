import type { MetadataRoute } from "next";
import { cohorts } from "@/content/cohorts";
import { labs } from "@/content/labs";
import { navigation, secondaryNavigation } from "@/content/site";
import { siteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    ...navigation.map((n) => n.href),
    ...secondaryNavigation.map((n) => n.href),
    "/join",
    ...cohorts.map((c) => `/cohorts/${c.slug}`),
    ...labs.map((l) => `/labs/${l.slug}`),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
