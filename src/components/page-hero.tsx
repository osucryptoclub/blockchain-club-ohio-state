import type { CSSProperties, ReactNode } from "react";
import { OvalStatic } from "@/components/oval-static";

type Props = { title: string; children: ReactNode; action?: ReactNode };

/** Opener shared by every inner page. */
export function PageHero({ title, children, action }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(58rem_25rem_at_80%_100%,#bb0000,#5c0000_42%,transparent_76%)] max-lg:bg-[radial-gradient(34rem_15rem_at_70%_100%,#bb0000,#5c0000_42%,transparent_76%)]"
      />
      <OvalStatic className="absolute -right-48 -bottom-[19rem] -z-10 size-[40rem] text-white/55 lg:-right-24 lg:-bottom-[26rem] lg:size-[62rem]" />
      <div className="shell flex flex-col justify-end pt-24 pb-64 lg:min-h-[min(44rem,calc(100svh-9rem))] lg:pt-36 lg:pb-28">
        <h1 className="enter wide max-w-[14ch] text-title">{title}</h1>
        <p className="enter mt-8 max-w-[44ch] text-lead" style={{ "--delay": "120ms" } as CSSProperties}>
          {children}
        </p>
        {action && (
          <div className="enter mt-10 flex flex-wrap gap-4" style={{ "--delay": "220ms" } as CSSProperties}>
            {action}
          </div>
        )}
      </div>
    </section>
  );
}
