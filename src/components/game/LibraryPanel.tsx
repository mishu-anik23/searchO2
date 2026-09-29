import { LIBRARY } from "@/game/data";
import { useGame } from "@/game/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LibraryPanel() {
  const open = useGame((s) => s.libraryOpen);
  const id = useGame((s) => s.libraryId);
  const close = useGame((s) => s.closeLibrary);
  const openLibrary = useGame((s) => s.openLibrary);
  const unlocked = useGame((s) => s.unlockedTopics);
  const article = LIBRARY.find((a) => a.id === id) ?? LIBRARY[0];

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? openLibrary() : close())}>
      <SheetContent className="bg-surface">
        <SheetHeader>
          <SheetTitle>Science library</SheetTitle>
          <p className="mt-1 text-sm text-muted">
            Short notes for school science. {unlocked.length} of {LIBRARY.length} opened on a mission.
          </p>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden">
          <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
            {LIBRARY.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => openLibrary(a.id)}
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
            <Badge tone={unlocked.includes(article.id) ? "go" : "mute"}>
              {unlocked.includes(article.id) ? "Opened on a mission" : "Background reading"}
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
          </article>
        </div>
      </SheetContent>
    </Sheet>
  );
}
