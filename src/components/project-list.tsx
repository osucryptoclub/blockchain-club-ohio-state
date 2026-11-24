import { Code, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TextLink } from "@/components/action";
import { projectKinds, projectStatuses, type Project } from "@/content/projects";
import { getCohort } from "@/lib/roster";

const isSource = (url: string) => url.startsWith("https://github.com/");

/** The stages a project's data moves through, drawn as linked blocks. */
function Flow({ stages }: { stages: string[] }) {
  return (
    <ol className="mt-10 flex flex-col gap-6 lg:flex-row lg:gap-10">
      {stages.map((stage, i) => (
        <li
          key={stage}
          className="rule relative flex items-center gap-3 border px-5 py-4 font-semibold lg:flex-1"
        >
          {i > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-6 left-6 h-6 w-0.5 bg-scarlet lg:top-1/2 lg:-left-10 lg:h-0.5 lg:w-10"
            />
          )}
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-scarlet" />
          {stage}
        </li>
      ))}
    </ol>
  );
}

function CohortTag({ slug }: { slug: string }) {
  const cohort = getCohort(slug);
  if (!cohort) return null;
  return (
    <Link
      href={`/cohorts/${slug}`}
      className="inline-flex items-center gap-2 bg-scarlet px-2.5 py-1 text-white hover:bg-scarlet-dark"
    >
      {cohort.name} cohort · {cohort.term}
    </Link>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="border-t-2 border-current">
      {projects.map((project) => (
        <li key={project.slug} id={project.slug} className="rule border-b py-10 lg:py-14">
          <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="wide text-[clamp(1.75rem,3.4vw,3rem)] leading-none">{project.title}</h3>
              <p className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
                <span className="border border-current px-2.5 py-1">{projectKinds[project.kind]}</span>
                <span className="border border-current px-2.5 py-1">{projectStatuses[project.status]}</span>
                {project.cohort && <CohortTag slug={project.cohort} />}
              </p>
              {project.image && (
                <Image
                  src={project.image}
                  alt={`Screenshot of ${project.title}`}
                  width={1280}
                  height={720}
                  sizes="(min-width: 64rem) 36vw, 90vw"
                  className="mt-8 aspect-video w-full border border-current/15 object-cover"
                />
              )}
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-[58ch] text-lead">{project.summary}</p>
              <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li key={t} className="bg-current/[0.07] px-2.5 py-1 font-mono text-[0.8125rem]">
                    {t}
                  </li>
                ))}
              </ul>
              {project.contributors && <p className="muted mt-1">By {project.contributors.join(", ")}</p>}
              <p className="mt-6 flex flex-wrap items-center gap-6">
                {project.links.map((l) => (
                  <span key={l.url} className="inline-flex items-center gap-2">
                    {isSource(l.url) ? (
                      <Code size={16} aria-hidden="true" />
                    ) : (
                      <ExternalLink size={16} aria-hidden="true" />
                    )}
                    <TextLink href={l.url}>{l.label}</TextLink>
                  </span>
                ))}
              </p>
            </div>
          </div>
          {project.flow && <Flow stages={project.flow} />}
        </li>
      ))}
    </ul>
  );
}
