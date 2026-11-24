import Image from "next/image";
import type { ReactNode } from "react";
import type { Person } from "@/content/people";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** One person: photo or monogram, name, role, and the links they chose to share. */
export function PersonCard({ person, role }: { person: Person; role?: string }) {
  return (
    <li className="group min-w-0">
      <div className="relative mb-4 aspect-square w-full max-w-72 overflow-hidden bg-panel">
        {person.photo ? (
          <Image
            src={person.photo}
            alt=""
            fill
            sizes="(min-width: 80rem) 18rem, (min-width: 40rem) 40vw, 90vw"
            className="object-cover grayscale-[35%] transition duration-500 ease-block group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <span aria-hidden="true" className="wide absolute inset-0 grid place-items-center text-5xl text-white/25">
            {initials(person.name)}
          </span>
        )}
        <span aria-hidden="true" className="absolute bottom-0 left-0 size-4 bg-scarlet" />
      </div>
      <p className="text-lg font-bold">{person.name}</p>
      {role && <p>{role}</p>}
      {person.major && <p className="muted">{person.major}</p>}
      {person.achievements && person.achievements.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {person.achievements.map((a) => (
            <li key={a} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-scarlet" />
              {a}
            </li>
          ))}
        </ul>
      )}
      {person.links && (
        <p className="mt-3 flex flex-wrap gap-4 text-sm">
          {person.links.map((l) => (
            <a key={l.url} href={l.url} rel="noopener" className="link" aria-label={`${person.name} on ${l.label}`}>
              {l.label}
            </a>
          ))}
        </p>
      )}
    </li>
  );
}

export function PeopleGrid({ children }: { children: ReactNode }) {
  return <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>;
}
