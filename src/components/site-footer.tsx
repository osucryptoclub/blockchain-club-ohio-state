import Link from "next/link";
import { ChannelLink } from "@/components/channel-link";
import { LogoLink, Seal } from "@/components/logo";
import { disclaimer, navigation, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="rule relative overflow-hidden border-t bg-black text-white">
      <div className="shell pt-16 pb-10 lg:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <LogoLink>
              <Seal className="size-28" sizes="112px" />
              <span className="sr-only">Blockchain Club at Ohio State, home</span>
            </LogoLink>
            <p className="muted mt-6 max-w-[30ch] text-lead">{site.tagline}</p>
          </div>
          <nav aria-label="Footer" className="lg:col-span-4">
            <h2 className="text-sm text-gray-400">Site</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-10">
              {[...navigation, { href: "/join", label: "Join the Club" }].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="inline-block py-1.5 hover:underline hover:underline-offset-4">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-3">
            <h2 className="text-sm text-gray-400">Community</h2>
            <ul className="mt-3">
              {site.email && (
                <li className="py-1.5">
                  <a href={`mailto:${site.email}`} className="link">
                    {site.email}
                  </a>
                </li>
              )}
              {site.channels.map((c) => (
                <li key={c.id} className="py-1.5">
                  <ChannelLink channel={c} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="wide rise mt-20 text-[min(10.9vw,10.15rem)] leading-[0.92] lg:mt-28">
          Blockchain Club <span className="block">at Ohio State</span>
        </p>

        <div className="rule mt-14 border-t pt-6">
          <p className="max-w-[90ch] text-sm text-gray-400">{disclaimer}</p>
          {/* A full load, because the choice to play is made before first paint. */}
          <p className="mt-4 text-sm motion-reduce:hidden">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/?intro" className="link text-gray-400 hover:text-white">
              Replay the introduction
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
