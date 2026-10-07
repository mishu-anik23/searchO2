import { BookOpen, FlaskConical, Wallet } from "lucide-react";
import { formatKg, formatUsd } from "@/lib/utils";
import { rankForRxp } from "@/game/civ-v2";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Chrome({ onLibrary }: { onLibrary: () => void }) {
  const credits = useGame((s) => s.credits);
  const oxygenKg = useGame((s) => s.oxygenKg);
  const researchXp = useGame((s) => s.researchXp ?? 0);
  const rank = rankForRxp(researchXp);
  const commander = useGame((s) => s.commander);
  const fpvOpen = useGame((s) => s.fpvOpen);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-sm">
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold tracking-tight">OxyForge</p>
        <p className="truncate text-xs text-muted">{commander || "Cadet"} · Mission control</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone="accent">{formatKg(oxygenKg)} O₂</Badge>
          <Badge tone="mute" className="gap-1"><FlaskConical className="size-3" />{researchXp} RXP · {rank.title}</Badge>
        </div>
        <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-raised px-3 font-mono text-sm tabular-nums">
          <Wallet className="size-3.5 text-accent" />
          <span>{formatUsd(credits)}</span>
        </div>
        {fpvOpen && (
          <Badge tone="warn" className="hidden sm:inline-flex">
            Cam $180/s
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={onLibrary} aria-label="Open science library">
          <BookOpen className="size-4" />
        </Button>
      </div>
    </header>
  );
}
