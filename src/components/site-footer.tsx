import Link from "next/link";
import { ChannelLink } from "@/components/channel-link";
import { Mark } from "@/components/logo";
import { disclaimer, navigation, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="shell pt-16 pb-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-24">
          <div>
            <Mark className="h-12 w-18" />
            <p className="wide mt-6 max-w-[16ch] text-heading text-balance">{site.name}</p>
          </div>
          <nav aria-label="Footer">
            <h2 className="text-sm text-gray-400">Site</h2>
            <ul className="mt-3 grid gap-x-10 sm:max-lg:grid-cols-2">
              {[...navigation, { href: "/join", label: "Join the Club" }].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="inline-block py-1.5 hover:underline hover:underline-offset-4">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-sm text-gray-400">Community</h2>
            <ul className="mt-3">
              {site.channels.map((c) => (
                <li key={c.id} className="py-1.5">
                  <ChannelLink channel={c} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-800 pt-6">
          <p className="max-w-[80ch] text-sm text-gray-400">{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
