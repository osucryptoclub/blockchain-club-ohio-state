import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero, Split } from "@/components/page-hero";
import { ProjectList } from "@/components/project-list";
import { projects } from "@/content/projects";
import { channel, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Projects",
  description: `Software, research, and hackathon work by members of ${site.name}.`,
  alternates: { canonical: "/projects" },
};

const steps = [
  { title: "Start", text: "Open a repository with a README that says what it does and how to run it." },
  { title: "Review", text: "Get another member to read the code or the argument and try to break it." },
  { title: "Publish", text: "Once it is public and works, it can be listed here with its authors’ names." },
];

export default function Projects() {
  const github = channel("github");
  return (
    <>
      <PageHero
        title="Work you can check."
        action={
          github.url && (
            <Action href={github.url} variant="inverse">
              Browse our GitHub
            </Action>
          )
        }
      >
        Student software, research, and hackathon projects. Everything listed here is public, so you can read
        it, run it, and improve it.
      </PageHero>

      <section className="band">
        <div className="shell">
          <h2 className="wide mb-10 text-heading">Projects</h2>
          {projects.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <p className="max-w-[50ch] text-lead">
              No projects are listed yet. The first ones will appear here as they are published.
            </p>
          )}
        </div>
      </section>

      <Split title="Get your project listed" className="bg-gray-100">
        <ol className="border-t border-ink">
          {steps.map(({ title, text }, i) => (
            <li key={title} className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <h3 className="font-bold">
                {i + 1}. {title}
              </h3>
              <p className="text-gray-600">{text}</p>
            </li>
          ))}
        </ol>
      </Split>
    </>
  );
}
