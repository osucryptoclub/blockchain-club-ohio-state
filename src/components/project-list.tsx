import { TextLink } from "@/components/action";
import { projectKinds, projectStatuses, type Project } from "@/content/projects";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="border-t border-ink">
      {projects.map((project) => (
        <li
          key={project.slug}
          id={project.slug}
          className="grid gap-x-10 gap-y-5 border-b border-gray-200 py-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        >
          <div>
            <h3 className="wide text-subhead">{project.title}</h3>
            <p className="mt-2 text-gray-600">
              {projectKinds[project.kind]}, {projectStatuses[project.status].toLowerCase()}
            </p>
          </div>
          <div>
            <p className="max-w-[62ch]">{project.summary}</p>
            <p className="mt-3 text-sm text-gray-600">Built with {project.stack.join(", ")}</p>
            {project.contributors && (
              <p className="mt-1 text-sm text-gray-600">By {project.contributors.join(", ")}</p>
            )}
            <p className="mt-5 flex flex-wrap gap-6">
              {project.links.map((l) => (
                <TextLink key={l.url} href={l.url}>
                  {l.label}
                </TextLink>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
