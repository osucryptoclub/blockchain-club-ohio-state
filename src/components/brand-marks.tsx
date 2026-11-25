import type { ReactNode } from "react";

/**
 * Logo concepts. All original artwork, drawn on the club's one repeating shape,
 * the square block. Each takes `currentColor` for its line work and `accent`
 * for the block that is "lit", so it works on black, white, and scarlet.
 */

type MarkProps = { className?: string; accent?: string; title?: string };

function Svg({ viewBox, className, title, children }: { viewBox: string; className?: string; title?: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** A. The Oval Network. Four paths cross a ring; the block sits where they meet. */
export function OvalNetworkMark({ className, accent = "var(--color-scarlet)", title }: MarkProps) {
  return (
    <Svg viewBox="0 0 48 32" className={className} title={title}>
      <ellipse cx="24" cy="16" rx="21.5" ry="13.5" strokeWidth="2.75" />
      <path strokeWidth="1.75" d="M12.9 4.5 44.4 20.2M3.6 11.8 35.1 27.5M3.6 20.2 35.1 4.5M12.9 27.5 44.4 11.8" />
      <path fill={accent} stroke="none" d="M24 9.2 37.6 16 24 22.8 10.4 16z" />
    </Svg>
  );
}

/** B. The Next Block. Three linked blocks climbing to the right; the newest is lit. */
export function NextBlockMark({ className, accent = "var(--color-scarlet)", title }: MarkProps) {
  return (
    <Svg viewBox="0 0 40 40" className={className} title={title}>
      <path strokeWidth="2.5" d="M11 29.5H20V25M24.5 20.5H32.5V16" />
      <rect x="2" y="25" width="9" height="9" fill="currentColor" stroke="none" />
      <rect x="15.5" y="16" width="9" height="9" fill="currentColor" stroke="none" />
      <rect x="27" y="5" width="11" height="11" fill={accent} stroke="none" />
    </Svg>
  );
}

/** C. The Root. A Merkle tree read upward: eight leaves hash into one lit root. */
export function MerkleRootMark({ className, accent = "var(--color-scarlet)", title }: MarkProps) {
  const leaves = [2, 7, 12, 17, 22, 27, 32, 37];
  return (
    <Svg viewBox="0 0 42 40" className={className} title={title}>
      <path
        strokeWidth="1.75"
        d="M3 31V27H8V31M13 31V27H18V31M23 31V27H28V31M33 31V27H38V31M5.5 27V22H15.5V27M25.5 27V22H35.5V27M10.5 22V16H30.5V22"
      />
      {leaves.map((x) => (
        <rect key={x} x={x - 1} y="31" width="4" height="4" fill="currentColor" stroke="none" />
      ))}
      <rect x="14" y="3" width="13" height="13" fill={accent} stroke="none" />
    </Svg>
  );
}

/** The primary lockup: the Oval Network mark beside the club name. */
export function Lockup({ className = "", accent }: { className?: string; accent?: string }) {
  return (
    <span className={`flex items-center gap-[0.55em] ${className}`}>
      <OvalNetworkMark className="h-[1.9em] w-auto shrink-0" accent={accent} />
      <span className="leading-[1.02]">
        <span className="wide block whitespace-nowrap uppercase">Blockchain Club</span>
        <span className="block text-[0.62em] font-medium tracking-[0.18em] uppercase">at Ohio State</span>
      </span>
    </span>
  );
}
