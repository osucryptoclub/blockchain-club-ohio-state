import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";

const row = "grid gap-x-8 gap-y-1 py-6 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-baseline";

/** Every club channel. Open ones are links; the rest say they are coming. */
export function ChannelList() {
  return (
    <ul className="rule border-t">
      {site.channels.map((c) => {
        const body = (
          <>
            <span className="wide text-subhead">{c.label}</span>
            <span>{c.purpose}</span>
          </>
        );
        return (
          <li key={c.id} className="rule border-b">
            {c.url ? (
              <a
                href={c.url}
                rel="noopener"
                className={`block-fill transition-colors [--bleed:1rem] [--fill:var(--color-white)] hover:text-black focus-visible:text-black ${row}`}
              >
                {body}
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  Open <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            ) : (
              <div className={row}>
                {body}
                <span className="text-sm">Coming soon</span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
