import type { Metadata } from "next";
import type { ComponentType } from "react";
import { Lockup, MerkleRootMark, NextBlockMark, OvalNetworkMark } from "@/components/brand-marks";
import { PageHero } from "@/components/page-hero";
import { Band, Rows, Split } from "@/components/section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Brand",
  description: `Logo, color, and type for ${site.name}. For members, partners, and press.`,
  alternates: { canonical: "/brand" },
};

type Concept = {
  id: string;
  name: string;
  Mark: ComponentType<{ className?: string; accent?: string; title?: string }>;
  idea: string;
  strengths: string;
  risk: string;
  recommended?: boolean;
};

const concepts: Concept[] = [
  {
    id: "a",
    name: "The Oval Network",
    Mark: OvalNetworkMark,
    idea: "Four paths cross a ring, with a block where they meet. It is the site’s 3D hero, reduced to one stroke.",
    strengths: "Owns a place (the Oval) without borrowing a university mark. Already ties the site together.",
    risk: "Detailed at tiny sizes; below 24px, drop the inner paths and keep the ring and block.",
    recommended: true,
  },
  {
    id: "b",
    name: "The Next Block",
    Mark: NextBlockMark,
    idea: "Three linked blocks climbing to the right. The newest one is lit: the block being built now.",
    strengths: "The strongest at favicon and avatar sizes. Reads as momentum without saying “to the moon.”",
    risk: "Simple enough that other projects use similar stairs. Needs the wordmark to be unmistakable.",
  },
  {
    id: "c",
    name: "The Root",
    Mark: MerkleRootMark,
    idea: "A Merkle tree read upward: many leaves hash into one root. Many members, one club.",
    strengths: "The most technical and the best story to tell in a pitch deck or on a shirt.",
    risk: "Busy below 32px, and the reference is lost on people outside the field.",
  },
];

const palette = [
  { name: "Black", hex: "#000000", use: "The ground. Pages, slides, and merch start here.", swatch: "bg-black rule border" },
  { name: "Scarlet", hex: "#BB0000", use: "The light. Buttons, the lit block, one accent per view.", swatch: "bg-scarlet" },
  { name: "Ember", hex: "#8B0000", use: "Scarlet’s shadow. Hover states and gradients only.", swatch: "bg-scarlet-dark" },
  { name: "Coal", hex: "#0B0B0C", use: "Raised surfaces on black: menus and cards.", swatch: "bg-coal rule border" },
  { name: "Panel", hex: "#141416", use: "Image placeholders and quiet fills.", swatch: "bg-panel" },
  { name: "Steel", hex: "#A7B1B7", use: "Secondary text and labels on black.", swatch: "bg-gray-400" },
  { name: "White", hex: "#FFFFFF", use: "Text on dark, and the paper sections.", swatch: "bg-white" },
];

const rules = [
  { title: "One lit block", text: "Scarlet marks the single most important thing in a view. If everything is red, nothing is." },
  { title: "Square, never round", text: "Blocks, buttons, and frames have square corners. The ring in the mark is the only curve." },
  { title: "Hairlines divide", text: "Separate content with 1px lines at 18% of the text color, not boxes and shadows." },
  { title: "No university marks", text: "Never use the Block O, the Ohio State seal, or Brutus. Our colors are ours; their logos are not." },
  { title: "No coins or rockets", text: "No coin icons, laser eyes, or price charts. We are here to build, not to shill." },
];

const tones = [
  { label: "On black", className: "bg-black text-white rule border" },
  { label: "On white", className: "bg-white text-black" },
  { label: "On scarlet", className: "bg-scarlet text-white", accent: "var(--color-black)" },
];

export default function Brand() {
  return (
    <>
      <PageHero title="The brand.">
        Three logo directions, the one we recommend, and the color and type that hold the club together on the
        site, in slides, on social, and on a shirt.
      </PageHero>

      <section className="band rule border-t">
        <div className="shell">
          <h2 className="rise wide mb-4 text-heading">Three concepts</h2>
          <p className="muted mb-12 max-w-[60ch] text-lead lg:mb-16">
            Each is built from the square block, so any of them fits the site as it is. They differ in what they ask
            the viewer to see: a place, a motion, or a structure.
          </p>
          <ol className="grid gap-px bg-white/15 lg:grid-cols-3">
            {concepts.map(({ id, name, Mark, idea, strengths, risk, recommended }) => (
              <li key={id} className="flex flex-col bg-black">
                <div className="relative grid h-64 shrink-0 place-items-center bg-coal lg:h-80">
                  <Mark className="h-28 w-auto text-white lg:h-32" title={`${name} logo concept`} />
                  <span className="absolute top-4 left-4 font-mono text-xs tracking-wider text-gray-400 uppercase">
                    Concept {id.toUpperCase()}
                  </span>
                  {recommended && (
                    <span className="absolute top-3 right-3 bg-scarlet px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex grow flex-col p-6 lg:p-8">
                  <h3 className="wide text-cell">{name}</h3>
                  <p className="mt-3">{idea}</p>
                  <dl className="mt-6 space-y-4 text-[0.9375rem]">
                    <div>
                      <dt className="font-semibold">Why it works</dt>
                      <dd className="muted">{strengths}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Watch out</dt>
                      <dd className="muted">{risk}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex items-end gap-4 pt-8" aria-hidden="true">
                    <span className="grid size-16 place-items-center bg-scarlet">
                      <Mark className="h-8 w-auto text-white" accent="var(--color-black)" />
                    </span>
                    <span className="grid size-10 place-items-center bg-white">
                      <Mark className="h-5 w-auto text-black" />
                    </span>
                    <Mark className="h-4 w-auto text-white" />
                    <span className="ml-auto font-mono text-xs text-gray-400">64 · 40 · 16px</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Band title="Primary logo" tone="paper">
        <p className="muted mb-12 max-w-[62ch] text-lead">
          Concept A, the Oval Network. It is the only one that belongs to Ohio State without borrowing from the
          university, and the site’s hero already teaches people to read it. Use the lockup by default, and the mark
          alone where space is square.
        </p>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-px bg-black/15 lg:grid-cols-3">
          {tones.map((t) => (
            <li key={t.label} className={`flex aspect-[16/10] flex-col justify-between p-6 ${t.className}`}>
              <span className="font-mono text-xs tracking-wider uppercase opacity-90">{t.label}</span>
              <Lockup className="text-[clamp(1rem,2vw,1.625rem)]" accent={t.accent} />
            </li>
          ))}
        </ul>
      </Band>

      <Band title="Color">
        <ul className="grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {palette.map((c) => (
            <li key={c.name} className="flex flex-col bg-black">
              <span aria-hidden="true" className={`block h-36 ${c.swatch}`} />
              <span className="p-5">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-lg font-semibold">{c.name}</span>
                  <span className="font-mono text-sm text-gray-400">{c.hex}</span>
                </span>
                <span className="muted mt-2 block text-[0.9375rem]">{c.use}</span>
              </span>
            </li>
          ))}
          <li className="flex flex-col justify-end bg-[radial-gradient(30rem_16rem_at_70%_110%,#bb0000,#5c0000_45%,#000_80%)] p-5">
            <span className="text-lg font-semibold">The glow</span>
            <span className="muted mt-2 block text-[0.9375rem]">
              The only gradient: scarlet rising from below, like light off the Oval at night.
            </span>
          </li>
        </ul>
      </Band>

      <Split title="Type">
        <div className="space-y-12">
          <div>
            <p className="font-mono text-xs tracking-wider text-gray-400 uppercase">Display · Archivo, 116% width, 620</p>
            <p className="wide mt-3 text-title">Build what comes next.</p>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider text-gray-400 uppercase">Text · Archivo, 100% width, 400</p>
            <p className="mt-3 max-w-[56ch] text-lead">
              One variable family does the whole job. Its width axis takes it from a compressed headline to an
              extended display line, so we never need a second sans.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider text-gray-400 uppercase">Data · IBM Plex Mono, 400</p>
            <p className="mt-3 font-mono text-subhead break-all">0x9f2c…e41a · block 18,204,113</p>
          </div>
          <p className="muted max-w-[56ch]">
            Both are free under the SIL Open Font License, on Google Fonts, so every member can use them in slides
            and designs.
          </p>
        </div>
      </Split>

      <Split title="Rules">
        <Rows items={rules} />
      </Split>
    </>
  );
}
