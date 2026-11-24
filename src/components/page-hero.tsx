import type { ReactNode } from "react";
import { OvalStatic } from "@/components/oval-static";

type Props = { title: string; children: ReactNode; action?: ReactNode };

/** Scarlet opener shared by every inner page. */
export function PageHero({ title, children, action }: Props) {
  return (
    <section className="relative overflow-hidden bg-scarlet text-white">
      <OvalStatic className="absolute -right-[22rem] -bottom-40 w-[56rem] text-white/30 max-lg:hidden" />
      <div className="shell relative pt-16 pb-16 lg:pt-28 lg:pb-24">
        <h1 className="wide max-w-[15ch] text-title">{title}</h1>
        <p className="mt-7 max-w-[46ch] text-lead">{children}</p>
        {action && <div className="mt-9 flex flex-wrap gap-4">{action}</div>}
      </div>
    </section>
  );
}

/** Two-column section: heading on the left, content on the right. */
export function Split({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`band ${className}`}>
      <div className="shell grid gap-8 lg:grid-cols-12">
        <h2 className="wide text-heading lg:col-span-5 lg:max-w-[12ch]">{title}</h2>
        <div className="min-w-0 lg:col-span-7">{children}</div>
      </div>
    </section>
  );
}
