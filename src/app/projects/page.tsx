import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { ProjectList } from "@/components/project-list";
import { Band, Cells, Rows, Split } from "@/components/section";
import { projectKindList, projects } from "@/content/projects";
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
        action={github.url && <Action href={github.url}>Browse our GitHub</Action>}
      >
        Student software, research, and hackathon projects. Everything listed here is public, so you can read
        it, run it, and improve it.
      </PageHero>

      <Band title="Projects" tone="paper">
          {projects.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <p className="max-w-[50ch] text-lead">
              No projects are listed yet. The first ones will appear here as they are published.
            </p>
          )}
        </Band>

      <Band title="What gets listed">
        <Cells items={projectKindList} />
      </Band>

      <Split title="Get your project listed">
        <Rows items={steps} ordered />
      </Split>
    </>
  );
}
