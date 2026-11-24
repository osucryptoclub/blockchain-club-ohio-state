"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type CSSProperties } from "react";
import { CohortsMenu } from "@/components/cohorts-menu";
import { Wordmark } from "@/components/logo";
import { navigation } from "@/content/site";
import { orderedCohorts } from "@/lib/roster";

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();

  return (
    <header className="site-header sticky top-0 z-40 border-b border-white/15 bg-black/85 text-white backdrop-blur-xl backdrop-saturate-150">
      <div className="shell flex h-18 items-center justify-between gap-6">
        <Link href="/">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 xl:flex">
          {navigation.map(({ href, label, menu }) =>
            menu === "cohorts" ? (
              <CohortsMenu key={href} label={label} />
            ) : (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="group relative py-2 text-[0.9375rem] font-medium text-white/80 transition-colors hover:text-white aria-[current=page]:text-white"
            >
              {label}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-scarlet transition-transform duration-300 ease-block group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
              />
            </Link>
            ),
          )}
          <Link
            href="/join"
            aria-current={pathname === "/join" ? "page" : undefined}
            className="block-fill bg-scarlet px-6 py-3 text-[0.9375rem] font-semibold transition-colors [--fill:var(--color-white)] hover:text-black focus-visible:text-black"
          >
            Join the Club
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          onClick={() => menu.current?.showModal()}
          className="-mr-2 grid size-11 cursor-pointer place-items-center xl:hidden"
        >
          <Menu aria-hidden="true" />
        </button>
      </div>
      <span aria-hidden="true" className="progress absolute inset-x-0 -bottom-px h-0.5 bg-scarlet" />

      <dialog
        ref={menu}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-scarlet text-white"
      >
        <div className="shell flex h-18 items-center justify-between border-b border-white/25">
          <Link href="/" onClick={close}>
            <Wordmark />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="-mr-2 grid size-11 cursor-pointer place-items-center"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile" className="shell flex flex-col py-4">
          {navigation.map(({ href, label, menu }, i) => (
            <div key={href} className="menu-item border-b border-white/25" style={{ "--i": i } as CSSProperties}>
              <Link
                href={href}
                onClick={close}
                aria-current={pathname === href ? "page" : undefined}
                className="wide block py-3.5 text-[1.75rem] leading-tight aria-[current=page]:underline aria-[current=page]:underline-offset-8"
              >
                {label}
              </Link>
              {menu === "cohorts" && (
                <ul className="-mt-1 pb-3.5">
                  {orderedCohorts.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/cohorts/${c.slug}`}
                        onClick={close}
                        aria-current={pathname === `/cohorts/${c.slug}` ? "page" : undefined}
                        className="flex items-center gap-3 py-1.5 pl-1 text-lg aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                      >
                        <span aria-hidden="true" className="size-2 bg-white" />
                        {c.name}, {c.term}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <Link
            href="/join"
            onClick={close}
            style={{ "--i": navigation.length } as CSSProperties}
            className="menu-item mt-6 bg-white px-6 py-4 text-center text-lg font-semibold text-black"
          >
            Join the Club
          </Link>
        </nav>
      </dialog>
    </header>
  );
}
