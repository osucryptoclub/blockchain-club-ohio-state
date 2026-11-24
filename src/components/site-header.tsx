"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Wordmark } from "@/components/logo";
import { navigation } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();

  return (
    <header className="sticky top-0 z-40 border-b border-white/25 bg-scarlet text-white">
      <div className="shell flex h-18 items-center justify-between gap-6">
        <Link href="/">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 xl:flex">
          {navigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="border-b-2 border-transparent py-1 text-[0.9375rem] font-medium hover:border-white aria-[current=page]:border-white"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/join"
            aria-current={pathname === "/join" ? "page" : undefined}
            className="bg-white px-5 py-2.5 text-[0.9375rem] font-semibold text-scarlet transition-colors hover:bg-ink hover:text-white"
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
          {navigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              aria-current={pathname === href ? "page" : undefined}
              className="wide border-b border-white/25 py-3.5 text-2xl aria-[current=page]:underline aria-[current=page]:underline-offset-8"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/join"
            onClick={close}
            className="mt-6 bg-white px-6 py-4 text-center text-lg font-semibold text-scarlet"
          >
            Join the Club
          </Link>
        </nav>
      </dialog>
    </header>
  );
}
