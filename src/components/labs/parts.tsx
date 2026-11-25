"use client";

import { Check, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";

/** Shares through the phone's own menu where there is one, and copies elsewhere. */
export function ShareButton({ text, label = "Share result" }: { text: string; label?: string }) {
  const [done, setDone] = useState<"" | "Copied" | "Could not copy">("");
  async function share() {
    const url = location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setDone("Copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setDone("Could not copy");
    }
    window.setTimeout(() => setDone(""), 2400);
  }
  return (
    <button type="button" onClick={share} className="lab-button border border-white/40 hover:bg-white hover:text-black">
      {done === "Copied" ? <Check size={17} aria-hidden="true" /> : <Share2 size={17} aria-hidden="true" />}
      <span aria-live="polite">{done || label}</span>
    </button>
  );
}

export function LabButton({ children, onClick, disabled, quiet }: { children: ReactNode; onClick: () => void; disabled?: boolean; quiet?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`lab-button ${quiet ? "border border-white/40 hover:bg-white hover:text-black" : "bg-scarlet hover:bg-white hover:text-black"} disabled:pointer-events-none disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 border border-white/15 bg-white/4 p-5 backdrop-blur-md lg:p-7 ${className}`}>
      <h3 className="mb-5 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function Stat({ label, value, loud }: { label: string; value: string; loud?: boolean }) {
  return (
    <div className="border-t border-white/20 pt-3">
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className={`wide mt-1 text-subhead tabular-nums ${loud ? "bg-scarlet px-2 py-0.5" : ""} w-fit`}>{value}</dd>
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; format: (n: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between gap-4">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="font-semibold tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-scarlet"
      />
    </label>
  );
}
