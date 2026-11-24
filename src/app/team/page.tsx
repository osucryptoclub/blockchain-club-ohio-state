import type { Metadata } from "next";
import Image from "next/image";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
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
          className="mb-4 aspect-square w-full max-w-72 bg-gray-200 object-cover"
        />
      )}
      <p className="text-lg font-bold">{member.name}</p>
      <p>{member.role}</p>
      {member.major && <p className="text-gray-600">{member.major}</p>}
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

      <section className="band">
        <div className="shell">
          <h2 className="sr-only">Leadership and teams</h2>
          <ul className="border-t border-ink">
            {team.map((group) => (
              <li key={group.name} className="grid gap-x-10 gap-y-6 border-b border-gray-200 py-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <h3 className="wide text-subhead">{group.name}</h3>
                  <p className="mt-2 max-w-[40ch] text-gray-600">{group.responsibility}</p>
                </div>
                <div className="lg:col-span-7">
                  {group.members.length > 0 ? (
                    <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                      {group.members.map((m) => (
                        <Person key={m.name} member={m} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">{group.placeholder ?? "To be announced"}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-14">
            <Action href="/join">Join the Club</Action>
          </div>
        </div>
      </section>
    </>
  );
}
