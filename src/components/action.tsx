import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  /** On white or dark grounds. */
  primary: "bg-scarlet text-white hover:bg-scarlet-dark",
  /** On scarlet grounds. */
  inverse: "bg-white text-scarlet hover:bg-ink hover:text-white",
  outline: "border border-current hover:bg-current/10",
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
  const className = `group inline-flex min-h-13 items-center gap-3 px-6 py-3 font-semibold transition-colors ${variants[variant]}`;
  const body = (
    <>
      {children}
      <Icon
        size={18}
        aria-hidden="true"
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
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
  const className = "link inline-flex items-center gap-1.5 font-semibold";
  return isExternal(href) ? (
    <a href={href} className={className} rel="noopener">
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
