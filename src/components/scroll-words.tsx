import type { CSSProperties } from "react";

/** A statement that brightens word by word as it scrolls through the page. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={`words ${className}`}>
      {words.map((word, i) => (
        <span key={i} style={{ "--at": (i / words.length).toFixed(3) } as CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
