import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  /** On black or white grounds. */
  primary: "bg-scarlet text-white [--fill:var(--color-white)] hover:text-black focus-visible:text-black",
  /** On scarlet grounds. */
  inverse: "bg-white text-black [--fill:var(--color-black)] hover:text-white focus-visible:text-white",
  outline: "border border-current/40 [--fill:color-mix(in_srgb,currentColor_14%,transparent)]",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
};

const isExternal = (href: string) => href.startsWith("http");

export function Action({ href, children, variant = "primary" }: Props) {
  const external = isExternal(href);
  const Icon = external ? ArrowUpRight : ArrowRight;
  const className = `block-fill group inline-flex min-h-14 items-center gap-4 px-7 py-3 font-semibold transition-colors ${variants[variant]}`;
  const body = (
    <>
      {children}
      <Icon
        size={18}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );
  return external || href.startsWith("mailto:") ? (
    <a href={href} className={className} {...(external && { rel: "noopener" })}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

export function TextLink({ href, children }: Omit<Props, "variant">) {
  const className = "link group inline-flex items-center gap-1.5 font-semibold";
  const icon = "transition-transform duration-300 group-hover:translate-x-0.5";
  return isExternal(href) ? (
    <a href={href} className={className} rel="noopener">
      {children}
      <ArrowUpRight size={16} aria-hidden="true" className={icon} />
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" className={icon} />
    </Link>
  );
}
