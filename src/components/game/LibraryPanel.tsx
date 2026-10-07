import { useMemo, useState } from "react";
import { LIBRARY } from "@/game/data";
import { CIV_LAYERS_V2 } from "@/game/civ-v2";
import { useGame } from "@/game/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LibraryPanel() {
  const open = useGame((s) => s.libraryOpen);
  const id = useGame((s) => s.libraryId);
  const close = useGame((s) => s.closeLibrary);
  const openLibrary = useGame((s) => s.openLibrary);
  const unlocked = useGame((s) => s.unlockedTopics);
  const topicStamps = useGame((s) => s.topicStamps);
  const libraryGateActive = useGame((s) => s.libraryGateActive);
  const completeLibraryGate = useGame((s) => s.completeLibraryGate);
  const habitatStep = useGame((s) => s.habitatStep);
  const article = LIBRARY.find((a) => a.id === id) ?? LIBRARY[0];

  const gateLayer = useMemo(() => {
    if (!libraryGateActive) return null;
    return CIV_LAYERS_V2[Math.min(habitatStep, CIV_LAYERS_V2.length - 1)] ?? null;
  }, [libraryGateActive, habitatStep]);

  const [ticketIdx, setTicketIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [passed, setPassed] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const resetTicket = () => {
    setTicketIdx(0);
    setPicked(null);
    setPassed(0);
    setShowResult(false);
  };

  const onOpenChange = (v: boolean) => {
    if (v) openLibrary();
    else {
      close();
      resetTicket();
    }
  };

  const questions = gateLayer?.exitTicket ?? [];
  const q = questions[ticketIdx];
  const stamp = topicStamps[article.id] ?? (unlocked.includes(article.id) ? "opened" : "unread");

  const submitAnswer = () => {
    if (picked === null || !q) return;
    const ok = picked === q.answer;
    setShowResult(true);
    if (ok) {
      const nextPassed = passed + 1;
      setPassed(nextPassed);
      window.setTimeout(() => {
        if (ticketIdx + 1 >= questions.length) {
          completeLibraryGate();
          resetTicket();
        } else {
          setTicketIdx(ticketIdx + 1);
          setPicked(null);
          setShowResult(false);
        }
      }, 600);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface">
        <SheetHeader>
          <SheetTitle>Science library</SheetTitle>
          <p className="mt-1 text-sm text-muted">
            Short notes for school science. {unlocked.length} of {LIBRARY.length} opened ·{" "}
            {Object.values(topicStamps).filter((s) => s === "stamped").length} stamped.
          </p>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden">
          <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
            {LIBRARY.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  openLibrary(a.id);
                  resetTicket();
                }}
                className={cn(
                  "shrink-0 rounded-sm px-2 py-1.5 text-left text-xs",
                  a.id === article.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
                )}
              >
                {a.title}
              </button>
            ))}
          </nav>
          <article className="overflow-y-auto px-6 py-5">
            <Badge tone={stamp === "stamped" ? "go" : stamp === "opened" ? "accent" : "mute"}>
              {stamp === "stamped" ? "Stamped · you can explain it" : stamp === "opened" ? "Opened on a mission" : "Unread"}
            </Badge>
            <h3 className="mt-3 font-display text-2xl font-semibold">{article.title}</h3>
            <p className="mt-1 text-sm text-accent">{article.kicker}</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg/90">
              {article.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {article.math && (
              <div className="mt-4 rounded-md border border-border bg-raised p-3 font-mono text-xs text-accent">
                {article.math}
              </div>
            )}

            {libraryGateActive && gateLayer && questions.length > 0 && (
              <div className="mt-6 rounded-xl border border-accent/40 bg-raised p-4">
                <p className="text-xs uppercase tracking-wide text-accent">Exit ticket · layer gate</p>
                <p className="mt-1 text-sm text-muted">
                  Read the note, then answer {questions.length} short questions. Build unlocks after both are correct.
                </p>
                {q && (
                  <div className="mt-4">
                    <p className="font-medium text-fg">
                      {ticketIdx + 1}/{questions.length}. {q.q}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.choices.map((c, i) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setPicked(i);
                            setShowResult(false);
                          }}
                          className={cn(
                            "block w-full rounded-md border px-3 py-2.5 text-left text-sm transition",
                            picked === i
                              ? "border-accent bg-accent/15 text-fg"
                              : "border-border bg-surface text-muted hover:border-accent/50 hover:text-fg",
                            showResult && picked === i && i === q.answer && "border-go bg-go/15 text-fg",
                            showResult && picked === i && i !== q.answer && "border-warn bg-warn/10",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {showResult && picked !== null && picked !== q.answer && (
                      <p className="mt-2 text-sm text-warn">Not quite — skim the note above and try again.</p>
                    )}
                    <Button className="mt-4 w-full" disabled={picked === null} onClick={submitAnswer}>
                      {ticketIdx + 1 >= questions.length && passed + (picked === q.answer ? 1 : 0) >= questions.length
                        ? "Stamp & unlock field task"
                        : "Check answer"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      </SheetContent>
    </Sheet>
  );
}
