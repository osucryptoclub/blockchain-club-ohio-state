import { TextLink } from "@/components/action";
import { projectKinds, projectStatuses, type Project } from "@/content/projects";

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
              </p>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-[58ch] text-lead">{project.summary}</p>
              <p className="muted mt-4">Built with {project.stack.join(", ")}</p>
              {project.contributors && <p className="muted mt-1">By {project.contributors.join(", ")}</p>}
              <p className="mt-6 flex flex-wrap gap-6">
                {project.links.map((l) => (
                  <TextLink key={l.url} href={l.url}>
                    {l.label}
                  </TextLink>
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
