import Image from "next/image";
import logo from "@/assets/club-logo.jpg";

/** The club's seal. The file has white corners, so it is clipped to its circle. */
export function Seal({ className = "", sizes, eager = false }: { className?: string; sizes: string; eager?: boolean }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-full ${className}`}>
      <Image src={logo} alt="" sizes={sizes} loading={eager ? "eager" : "lazy"} className="size-full scale-[1.04] object-cover" />
    </span>
  );
}

/** Club mark: four paths crossing a ring, with a block where they meet. Original artwork. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <ellipse cx="24" cy="16" rx="21.5" ry="13.5" strokeWidth="2.75" />
      <path
        strokeWidth="1.75"
        d="M12.9 4.5 44.4 20.2M3.6 11.8 35.1 27.5M3.6 20.2 35.1 4.5M12.9 27.5 44.4 11.8"
      />
      <path fill="currentColor" stroke="none" d="M24 10 36 16 24 22 12 16z" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <Seal className="size-13" sizes="52px" eager />
      <span className="text-[0.9375rem] leading-[1.15]">
        <span className="block font-bold tracking-tight">Blockchain Club </span>
        <span className="block">at Ohio State</span>
        <span className="sr-only">, home</span>
      </span>
    </span>
  );
}
