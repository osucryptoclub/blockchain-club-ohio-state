import type { ReactNode } from "react";
import { Action } from "@/components/action";

const tones = {
  black: "bg-black text-white",
  scarlet: "bg-scarlet text-white",
  paper: "bg-white text-black",
};

/** Two-column section: heading on the left, content on the right. */
export function Split({
  title,
  children,
  tone = "black",
  id,
}: {
  title: string;
  children: ReactNode;
  tone?: keyof typeof tones;
  id?: string;
}) {
  return (
    <section id={id} className={`band rule border-t ${tones[tone]}`}>
      <div className="shell grid gap-10 lg:grid-cols-12">
        <h2 className="wide text-heading lg:sticky lg:top-28 lg:col-span-5 lg:max-w-[12ch] lg:self-start">
          {title}
        </h2>
        <div className="min-w-0 lg:col-span-7">{children}</div>
      </div>
    </section>
  );
}

/** Full-width section with its heading above the content. */
export function Band({
  title,
  children,
  tone = "black",
}: {
  title: string;
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <section className={`band rule border-t ${tones[tone]}`}>
      <div className="shell">
        <h2 className="rise wide mb-12 text-heading lg:mb-16">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export type Entry = { title: string; text: string };

/** Ruled list of titles and descriptions. */
export function Rows({
  items,
  ordered = false,
  heading: Heading = "h3",
}: {
  items: Entry[];
  ordered?: boolean;
  heading?: "h3" | "h4";
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className="rule border-t">
      {items.map(({ title, text }, i) => (
        <li
          key={title}
          className="rise rule grid gap-x-8 gap-y-1 border-b py-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-baseline"
        >
          <Heading className="text-subhead font-semibold tracking-tight">
            {ordered && `${i + 1}. `}
            {title}
          </Heading>
          <p className="max-w-[56ch] opacity-85">{text}</p>
        </li>
      ))}
    </List>
  );
}

const columns = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

/** Hairline grid of statements, each marked with a block. */
export function Cells({ items, columns: count = 3 }: { items: Entry[]; columns?: keyof typeof columns }) {
  return (
    <ul className={`rule grid border-t border-l ${columns[count]}`}>
      {items.map(({ title, text }) => (
        <li
          key={title}
          className="rule group flex gap-5 border-r border-b p-6 transition-colors duration-300 hover:bg-current/5 sm:flex-col sm:gap-16 lg:gap-24 lg:p-8"
        >
          <span
            aria-hidden="true"
            className="size-3 shrink-0 origin-top-left bg-scarlet max-sm:mt-2 transition-transform duration-500 ease-block group-hover:scale-[2.5]"
          />
          <div>
            <h3 className="wide text-cell">{title}</h3>
            <p className="mt-2 max-w-[38ch] opacity-75 sm:mt-3">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Closing prompt used at the end of inner pages. */
export function Closing({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <section className="bg-scarlet py-24 text-white lg:py-36">
      <div className="shell flex flex-wrap items-end justify-between gap-10">
        <h2 className="rise wide max-w-[18ch] text-heading">{title}</h2>
        <Action href={href} variant="inverse">
          {label}
        </Action>
      </div>
    </section>
  );
}
