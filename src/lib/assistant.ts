/**
 * The club assistant's own answers. Works with no network and no model: it
 * matches a question to a topic and answers from club-knowledge.ts. When it
 * cannot match, it says so and points to the club's channels.
 */

import { formatLong, formatTime } from "./applications.ts";
import * as k from "./club-knowledge.ts";

export type Link = { label: string; href: string };
export type Reply = {
  /** Paragraphs separated by a blank line; lines starting "- " are list items. */
  text: string;
  links: Link[];
  /** The topic it answered, or null when it did not know. */
  topic: string | null;
};

export const suggestions = [
  "What is Blockchain Club at Ohio State?",
  "What are the four cohorts?",
  "Which cohort should I join?",
  "Do I need coding experience to join?",
  "How can I become a member?",
  "What projects are members working on?",
  "What events and workshops do you host?",
  "How can I get involved with blockchain?",
  "What opportunities are available for beginners?",
  "How can I contact the leadership team?",
];

const contactLinks = (): Link[] => [
  ...k.openChannels.filter((c) => ["groupme", "instagram", "linkedin"].includes(c.id)).map((c) => ({ label: c.label, href: c.url })),
  { label: "Contact page", href: "/contact" },
];

const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

function applyLine(now: Date): string {
  const a = k.applications;
  if (!a.deadline) return `Application dates for ${a.cohort} haven’t been announced yet. The Join page will show them as soon as they are.`;
  if (now.getTime() >= Date.parse(a.deadline)) return `Applications for ${a.cohort} closed on ${formatLong(a.deadline)}. The next window will be announced on the Join page.`;
  return `Applications for ${a.cohort} are due ${formatLong(a.deadline)}, ${formatTime(a.deadline)}.${a.applyUrl ? "" : " The application form link will be posted on the Join page."}`;
}

type Topic = { id: string; words: string[]; answer: (now: Date) => Omit<Reply, "topic"> };

const topics: Topic[] = [
  {
    id: "about",
    words: ["blockchain club", "about the club", "the club about", "mission", "who are you", "what does the club do", "what is the club", "purpose"],
    answer: () => ({
      text: `${k.site.description}\n\nOur mission: ${k.mission} Members work across four cohorts: ${k.tracks.map((t) => t.name).join(", ")}.`,
      links: [
        { label: "About", href: "/about" },
        { label: "What we do", href: "/what-we-do" },
      ],
    }),
  },
  {
    id: "cohorts",
    words: ["four cohorts", "cohorts", "cohort", "tracks", "track", "groups", "teams"],
    answer: () => ({
      text: `The club has four cohorts:\n\n${bullets(k.tracks.map((t) => `${t.name}: ${t.focus}`))}\n\nEvery cohort is open to every major.`,
      links: [{ label: "All cohorts", href: "/cohorts" }, ...k.activeCohorts.map((c) => ({ label: `${c.name}, ${c.term}`, href: `/cohorts/${c.slug}` }))],
    }),
  },
  {
    id: "which",
    words: ["which cohort", "should i join", "which one", "best for me", "fit", "recommend", "right for me", "choose", "pick"],
    answer: () => ({
      text: "Take the cohort assessment. It’s ten quick questions, and you’ll get your best fit, a runner-up, and the reasons behind both. The scoring is shown, so you can see exactly why.\n\nA rough guide: Builders if you want to write code, Investments if you like markets, Research if you like digging into how things work, and Marketing if you like people, design, and events.",
      links: [{ label: "Find your cohort", href: "/find-your-cohort" }],
    }),
  },
  {
    id: "coding",
    words: ["coding", "code", "program", "programming", "developer", "technical", "experience", "cs major", "computer science", "own crypto", "own any", "cryptocurrency to join"],
    answer: () => ({
      text: `No. ${k.eligibility.detail}\n\nIf you want to learn to code, Builders is the place. Investments, Research, and Marketing don’t require it.`,
      links: [
        { label: "Who can join", href: "/join" },
        { label: "Find your cohort", href: "/find-your-cohort" },
      ],
    }),
  },
  {
    id: "join",
    words: ["member", "membership", "join", "apply", "application", "sign up", "signup", "register", "become"],
    answer: (now) => ({
      text: `${k.eligibility.who}\n\n${bullets(k.joinSteps.map((s) => `${s.title}: ${s.text}`))}\n\n${applyLine(now)}`,
      links: [
        { label: "Join the club", href: "/join" },
        { label: "Deadline and how to apply", href: "/join#apply" },
      ],
    }),
  },
  {
    id: "projects",
    words: ["project", "projects", "working on", "build", "built", "building", "github", "pipeline"],
    answer: () => ({
      text: k.projects.length
        ? `${bullets(k.projects.map((p) => `${p.title}: ${p.summary}`))}\n\nThe source is public on GitHub.`
        : "No projects are listed on the site yet.",
      links: [{ label: "Projects", href: "/projects" }, ...k.projects.slice(0, 2).map((p) => ({ label: `${p.title} source`, href: p.links[0].url }))],
    }),
  },
  {
    id: "events",
    words: ["event", "events", "workshop", "workshops", "host", "speaker", "speakers", "hackathon", "hackathons", "meeting", "meetings", "meet", "when", "where", "time", "schedule"],
    answer: (now) => {
      const next = k.upcoming(now);
      const list = next.length
        ? `Coming up:\n\n${bullets(next.slice(0, 3).map((e) => `${e.title}, ${new Date(e.start).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}, ${e.location}`))}`
        : "No upcoming events are posted on the site yet, and I don’t have meeting times or rooms. Those are announced on the club’s channels.";
      return {
        text: `${list}\n\nThe club runs:\n\n${bullets(Object.values(k.eventTypes).map((t) => `${t.label}: ${t.description}`))}`,
        links: [{ label: "Events", href: "/events" }, ...contactLinks().slice(0, 2)],
      };
    },
  },
  {
    id: "involved",
    words: ["get involved", "involved", "start", "started", "learn blockchain", "learn", "how do i start", "get into", "participate"],
    answer: () => ({
      text: `Three ways to start:\n\n- Come to a meeting. They’re open to every student, with no application.\n- Try a lab on this site. Each one teaches a cohort’s core idea in a few minutes.\n- Take the cohort assessment to see where you fit, then apply when applications open.\n\nAlong the way you’ll learn:\n\n${bullets(k.learning.slice(0, 4))}`,
      links: [
        { label: "Labs", href: "/labs" },
        { label: "Find your cohort", href: "/find-your-cohort" },
        { label: "Join", href: "/join" },
      ],
    }),
  },
  {
    id: "beginners",
    words: ["beginner", "beginners", "new", "newbie", "no experience", "opportunities", "opportunity", "freshman", "first year", "never"],
    answer: () => ({
      text: `Beginners are welcome. ${k.eligibility.who}\n\n- Meetings are open to everyone, with no application.\n- The labs teach a real concept in a few minutes, with no setup.\n- Every cohort teaches from first principles, and Marketing and Investments need no code at all.\n\nWhat you’ll learn includes:\n\n${bullets(k.learning.slice(0, 3))}`,
      links: [
        { label: "Labs", href: "/labs" },
        { label: "Join", href: "/join" },
      ],
    }),
  },
  {
    id: "contact",
    words: ["contact", "leadership", "leaders", "officer", "officers", "president", "vice president", "email", "reach", "talk to", "message", "dm", "who runs", ...k.leaders.flatMap((l) => l.name.toLowerCase().split(" "))],
    answer: () => ({
      text: `${k.site.name} is led by:\n\n${bullets(k.leaders.map((l) => `${l.name}, ${l.role}`))}\n\n${k.site.email ? `Email ${k.site.email}.` : "The club’s email address hasn’t been posted yet."} The quickest way to reach the club is through ${k.openChannels
        .filter((c) => ["groupme", "instagram", "linkedin"].includes(c.id))
        .map((c) => c.label)
        .join(", ")}.`,
      links: [{ label: "Team", href: "/team" }, ...contactLinks()],
    }),
  },
  {
    id: "sponsors",
    words: ["sponsor", "sponsors", "sponsorship", "partner", "partners", "partnership", "company", "companies", "recruit", "recruiting"],
    answer: () => ({
      text: `Our sponsors:\n\n${bullets(k.sponsors.map((s) => `${s.name}: ${s.about}`))}\n\nCompanies can sponsor events, collaborate with student teams, speak, or recruit.`,
      links: [
        { label: "Sponsors", href: "/sponsors" },
        { label: "Contact", href: "/contact" },
      ],
    }),
  },
  {
    id: "labs",
    words: ["lab", "labs", "demo", "game", "interactive", "try"],
    answer: () => ({
      text: `Four labs, one per cohort, each teaching a real idea in a few minutes:\n\n${bullets(k.labs.map((l) => `${k.tracks.find((t) => t.slug === l.slug)?.name}: ${l.title}`))}`,
      links: k.labs.map((l) => ({ label: k.tracks.find((t) => t.slug === l.slug)?.name ?? l.slug, href: `/labs/${l.slug}` })),
    }),
  },
  ...k.tracks.map(
    (t): Topic => ({
      id: t.slug,
      words: [t.slug, t.name.toLowerCase(), ...t.keywords.map((w) => w.toLowerCase())],
      answer: () => {
        const c = k.activeCohorts.find((x) => x.name === t.name);
        return {
          text: `${t.description}\n\nWhat members do:\n\n${bullets(t.activities.slice(0, 5))}${c ? `\n\nThe ${c.term} cohort is ${c.status === "active" ? "in session" : "coming up"}.` : ""}`,
          links: [...(c ? [{ label: `${t.name}, ${c.term}`, href: `/cohorts/${c.slug}` }] : []), { label: `${t.name} lab`, href: `/labs/${t.slug}` }],
        };
      },
    }),
  ),
];

const normalize = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

/** Each matched phrase scores its word count, so specific phrases beat single words. */
function rank(question: string) {
  const q = normalize(question);
  return topics
    .map((t, order) => ({ t, order, score: t.words.reduce((s, w) => (q.includes(normalize(w)) ? s + normalize(w).trim().split(" ").length : s), 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);
}

/** The phrase that names a topic outright wins over a stray keyword elsewhere. */
const exact = new Map(suggestions.map((s, i) => [normalize(s), ["about", "cohorts", "which", "coding", "join", "projects", "events", "involved", "beginners", "contact"][i]]));

export const unknown = (): Reply => ({
  text: `I don’t have an answer to that on the club’s website, and I’d rather not guess. ${k.site.email ? `Email ${k.site.email}, or` : "The best way to ask is to"} message the club on one of its channels.`,
  links: contactLinks(),
  topic: null,
});

/** Money questions the site has no facts for. Better to say so than to answer a nearby topic. */
const unlisted = ["dues", "fee", "fees", "cost", "costs", "price", "pay", "paid", "charge", "tuition", "salary"];

export function answer(question: string, now = new Date()): Reply {
  if (unlisted.some((w) => normalize(question).includes(` ${w} `))) return unknown();
  const id = exact.get(normalize(question));
  const topic = id ? topics.find((t) => t.id === id) : rank(question)[0]?.t;
  if (!topic || question.trim().length < 2) return unknown();
  return { ...topic.answer(now), topic: topic.id };
}

/** For the server: checks a question is worth sending to a model. */
export const MAX_QUESTION = 500;
export const clean = (s: unknown) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, MAX_QUESTION) : "");
