"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

type Msg = { id: string; role: "user" | "bot"; text: string };

const demoReplies = [
  "Thanks — this is a demo reply. Wire your n8n webhook here later.",
  "Interesting point. (Demo) I’ll route this to your automation when connected.",
  "Got it. For now I’m static — hook up n8n to replace these responses.",
];

export function DemoChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "0",
      role: "bot",
      text: "Hi — Truth Assistant (demo). Connect n8n to this panel when you’re ready.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const uid = `${Date.now()}-u`;
    setMessages((m) => [...m, { id: uid, role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)]!;
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-b`, role: "bot", text: reply },
      ]);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 450);
  };

  return (
    <section
      id="assistant"
      className="scroll-mt-40 px-4 pb-8 pt-4 md:scroll-mt-44"
    >
      <div className="mx-auto max-w-6xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="tg-glass fixed bottom-24 right-4 z-[60] flex w-[min(100%,380px)] flex-col overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_40px_rgba(0,240,255,0.15)] md:bottom-8 md:right-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="font-[family-name:var(--font-orbitron)] text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Assistant (demo)
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-xs text-[#EAEAEA]/60 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[min(52vh,320px)] space-y-3 overflow-y-auto p-4 text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-3 py-2 ${
                        m.role === "user"
                          ? "bg-cyan-500/20 text-cyan-50"
                          : "bg-white/10 text-[#EAEAEA]/90"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 border-t border-white/10 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/35 focus:border-cyan-400/40"
                />
                <button
                  type="button"
                  onClick={send}
                  className="rounded-xl bg-cyan-500/25 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-400/40"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="fixed bottom-6 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/90 to-fuchsia-600/90 text-xl shadow-[0_0_28px_rgba(0,240,255,0.35)] md:right-8"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? "✕" : "💬"}
        </button>
      </div>
    </section>
  );
}
