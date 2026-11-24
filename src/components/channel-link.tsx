import type { Channel } from "@/content/site";

/** A link when the URL is known, and plain text that says so when it is not. */
export function ChannelLink({ channel }: { channel: Channel }) {
  if (!channel.url) {
    return (
      <span>
        {channel.label} <span className="text-gray-400">(coming soon)</span>
      </span>
    );
  }
  return (
    <a href={channel.url} rel="noopener" className="link">
      {channel.label}
    </a>
  );
}
