"use client";

import { ArrowUp, ArrowUpRight, MessageSquare, Minus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { answer, MAX_QUESTION, suggestions, unknown, type Link as ReplyLink, type Reply } from "@/lib/assistant";

type Message = { id: number; role: "user" | "assistant"; text: string; links?: ReplyLink[]; from?: "site" | "model" };

/** Whether the server has a model to ask. Learned from the first typed question. */
let modelReady: boolean | null = null;

async function askModel(question: string, history: Message[]): Promise<string | null> {
  if (modelReady === false) return null;
  try {
    const r = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, history: history.slice(-6).map(({ role, text }) => ({ role, text })) }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { text?: string | null; available?: boolean };
    modelReady = d.available !== false;
    return d.text?.trim() || null;
  } catch {
    return null;
  }
}

/** Paragraphs and "- " lists, the only formatting replies use. */
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n");
        return lines.every((l) => l.startsWith("- ")) ? (
          <ul key={i} className="grid gap-1.5">
            {lines.map((l) => (
              <li key={l} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-scarlet" />
                <span>{l.slice(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block}</p>
        );
      })}
    </>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" role="status" aria-label="The assistant is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className="assistant-dot size-1.5 bg-white/70" style={{ animationDelay: `${i * 160}ms` }} />
      ))}
    </div>
  );
}

/** The club assistant: a launcher in the bottom-right corner and a chat panel. */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const next = useRef(0);
  // Bumped when the conversation is cleared, so a late answer is dropped.
  const session = useRef(0);
  const title = useId();

  // Pulse until someone has opened it once.
  useEffect(() => {
    try {
      if (!localStorage.getItem("assistant-seen")) launcher.current?.classList.add("assistant-pulse");
    } catch {}
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, typing]);

  function show() {
    setOpen(true);
    launcher.current?.classList.remove("assistant-pulse");
    try {
      localStorage.setItem("assistant-seen", "1");
    } catch {}
    requestAnimationFrame(() => input.current?.focus());
  }
  function hide(clear: boolean) {
    setOpen(false);
    if (clear) {
      session.current++;
      setMessages([]);
      setDraft("");
      setTyping(false);
    }
    requestAnimationFrame(() => launcher.current?.focus());
  }

  async function ask(question: string, typed: boolean) {
    const q = question.trim().slice(0, MAX_QUESTION);
    if (!q || typing) return;
    const mine = session.current;
    const asked: Message = { id: next.current++, role: "user", text: q };
    const before = messages;
    setMessages((m) => [...m, asked]);
    setDraft("");
    setTyping(true);
    // A short pause so the answer doesn't flash in.
    const pause = new Promise((done) => window.setTimeout(done, 450));

    // Suggested questions always get the site's own answer. Typed ones go to
    // the model when the server has one, and fall back to the site's answer.
    let reply: Message;
    const local: Reply = answer(q);
    const modelText = typed ? await askModel(q, [...before, asked]) : null;
    if (modelText) reply = { id: next.current++, role: "assistant", text: modelText, links: local.topic ? local.links : unknown().links, from: "model" };
    else reply = { id: next.current++, role: "assistant", text: local.text, links: local.links, from: "site" };

    await pause;
    if (mine !== session.current) return;
    setMessages((m) => [...m, reply]);
    setTyping(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void ask(draft, true);
  }

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.text));
  const more = suggestions.filter((s) => !asked.has(s)).slice(0, 3);

  return (
    <div className="assistant">
      <button
        ref={launcher}
        type="button"
        onClick={() => (open ? hide(false) : show())}
        aria-expanded={open}
        aria-controls={open ? title + "panel" : undefined}
        aria-label={open ? "Minimize the club assistant" : "Ask the club assistant"}
        className={`assistant-launcher fixed right-4 bottom-4 z-50 grid size-13 cursor-pointer place-items-center bg-scarlet text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white sm:right-6 sm:bottom-6`}
      >
        {open ? <Minus size={22} aria-hidden="true" /> : <MessageSquare size={22} aria-hidden="true" />}
        {!open && messages.length > 0 && <span aria-hidden="true" className="absolute -top-1 -left-1 size-3 border-2 border-black bg-white" />}
      </button>

      {open && (
        <section
          id={title + "panel"}
          role="dialog"
          aria-modal="false"
          aria-labelledby={title}
          onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), hide(false))}
          className="assistant-panel fixed inset-x-2 bottom-20 z-50 flex max-h-[min(40rem,calc(100dvh-6.5rem))] flex-col border border-white/20 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:right-6 sm:bottom-22 sm:w-[25rem]"
        >
          <header className="flex items-center gap-3 border-b border-white/15 py-2 pr-2 pl-4">
            <span aria-hidden="true" className="size-3 bg-scarlet" />
            <h2 id={title} className="flex-1 font-semibold">
              Club assistant
            </h2>
            <button type="button" onClick={() => hide(false)} aria-label="Minimize" className="grid size-11 cursor-pointer place-items-center hover:bg-white/10">
              <Minus size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => hide(true)} aria-label="Close and clear the conversation" className="grid size-11 cursor-pointer place-items-center hover:bg-white/10">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-[0.9375rem] leading-relaxed">
            {messages.length === 0 && (
              <div>
                <p>Ask me about the club: cohorts, joining, projects, events, or who to contact. I answer from this website, and I’ll tell you when I don’t know.</p>
                <p className="mt-4 text-sm text-gray-400">Try one of these</p>
              </div>
            )}
            <div className="grid gap-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <p key={m.id} className="enter ml-auto max-w-[85%] bg-white px-3.5 py-2 text-black">
                    {m.text}
                  </p>
                ) : (
                  <div key={m.id} data-reply={m.from} className="enter grid max-w-[95%] gap-3">
                    <Body text={m.text} />
                    {m.links && m.links.length > 0 && (
                      <ul className="flex flex-wrap gap-2" aria-label="Links">
                        {m.links.map((l) => {
                          const external = l.href.startsWith("http");
                          const cls = "inline-flex min-h-9 items-center gap-1.5 border border-white/30 px-3 text-sm font-semibold hover:bg-white hover:text-black";
                          return (
                            <li key={l.href + l.label}>
                              {external ? (
                                <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                                  {l.label} <ArrowUpRight size={14} aria-hidden="true" />
                                  <span className="sr-only">(opens in a new tab)</span>
                                </a>
                              ) : (
                                <Link href={l.href} className={cls} onClick={() => matchMedia("(max-width: 639px)").matches && hide(false)}>
                                  {l.label}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ),
              )}
              {typing && <Typing />}
            </div>
            {!typing && (messages.length === 0 ? suggestions : more).length > 0 && (
              <ul className={`grid gap-2 ${messages.length ? "mt-5" : "mt-2"}`} aria-label="Suggested questions">
                {(messages.length === 0 ? suggestions : more).map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void ask(s, false)} className="w-full cursor-pointer border border-white/20 px-3 py-2 text-left text-sm hover:border-white hover:bg-white/10">
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={submit} className="flex items-end gap-2 border-t border-white/15 p-2">
            <label htmlFor={title + "q"} className="sr-only">
              Ask a question
            </label>
            <textarea
              ref={input}
              id={title + "q"}
              rows={1}
              value={draft}
              maxLength={MAX_QUESTION}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void ask(draft, true);
                }
              }}
              placeholder="Ask a question"
              className="max-h-32 min-h-11 flex-1 resize-none bg-white/5 px-3 py-2.5 text-[1rem] placeholder:text-gray-400 focus:outline-2 focus:outline-white"
            />
            <button type="submit" disabled={!draft.trim() || typing} aria-label="Send" className="grid size-11 shrink-0 cursor-pointer place-items-center bg-scarlet disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="px-4 pb-2 text-xs text-gray-400">Answers come from this website. Check important details with the club.</p>
        </section>
      )}
    </div>
  );
}
