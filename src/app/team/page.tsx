import type { Metadata } from "next";
import Image from "next/image";
import { Mark } from "@/components/logo";
import { PageHero } from "@/components/page-hero";
import { Closing } from "@/components/section";
import { site } from "@/content/site";
import { team, type Member } from "@/content/team";

export const metadata: Metadata = {
  title: "Team",
  description: `The students who lead ${site.name}.`,
  alternates: { canonical: "/team" },
};

function Person({ member }: { member: Member }) {
  return (
    <li className="min-w-0">
      {member.photo && (
        <Image
          src={member.photo}
          alt=""
          width={480}
          height={480}
          className="mb-4 aspect-square w-full max-w-72 bg-panel object-cover"
        />
      )}
      <p className="text-lg font-bold">{member.name}</p>
      <p>{member.role}</p>
      {member.major && <p className="muted">{member.major}</p>}
      {member.links && (
        <p className="mt-2 flex flex-wrap gap-4 text-sm">
          {member.links.map((l) => (
            <a key={l.url} href={l.url} rel="noopener" className="link" aria-label={`${member.name} on ${l.label}`}>
              {l.label}
            </a>
          ))}
        </p>
      )}
    </li>
  );
}

export default function Team() {
  const announced = team.some((group) => group.members.length > 0);
  return (
    <>
      <PageHero title="Run by students.">
        The club is led and organized by its members.
        {!announced && " Names will be added here once this year’s roles are confirmed."}
      </PageHero>

      <section className="band rule border-t">
        <div className="shell">
          <h2 className="sr-only">Leadership and teams</h2>
          <ul className="rule grid border-t border-l md:grid-cols-2">
            {team.map((group) => (
              <li
                key={group.name}
                className={`rule flex flex-col justify-between gap-8 md:min-h-64 border-r border-b p-6 lg:p-8 ${group.members.length > 0 ? "md:col-span-2" : ""}`}
              >
                <div>
                  <h3 className="wide text-cell">{group.name}</h3>
                  <p className="muted mt-3 max-w-[40ch]">{group.responsibility}</p>
                </div>
                <div>
                  {group.members.length > 0 ? (
                    <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                      {group.members.map((m) => (
                        <Person key={m.name} member={m} />
                      ))}
                    </ul>
                  ) : (
                    <p className="flex items-center gap-4">
                      <Mark className="h-6 w-9 text-scarlet" />
                      {group.placeholder ?? "To be announced"}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Closing title="Want to help run it?" href="/join" label="Join the Club" />
    </>
  );
}
