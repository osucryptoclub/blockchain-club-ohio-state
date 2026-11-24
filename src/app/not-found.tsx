import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageHero
      title="This page isn’t on the chain."
      action={<Action href="/">Go to the homepage</Action>}
    >
      The address may have changed, or the link may be wrong.
    </PageHero>
  );
}
