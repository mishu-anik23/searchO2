import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "mute",
  children,
}: {
  className?: string;
  tone?: "mute" | "go" | "nogo" | "accent" | "warn";
  children: ReactNode;
}) {
  const tones = {
    mute: "bg-raised text-muted border-border",
    go: "bg-go/15 text-go border-go/30",
    nogo: "bg-nogo/15 text-nogo border-nogo/30",
    accent: "bg-accent/15 text-accent border-accent/30",
    warn: "bg-warn/15 text-warn border-warn/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
