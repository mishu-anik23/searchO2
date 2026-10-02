import { useRef, type PointerEvent } from "react";
import type { CommanderProfile } from "@/game/data";
import { cn } from "@/lib/utils";

export function AvatarCard({
  profile,
  selected,
  compact,
  onSelect,
}: {
  profile: CommanderProfile;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  function tilt(e: PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 14).toFixed(2)}deg`);
  }
  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onPointerMove={tilt}
      onPointerLeave={reset}
      aria-pressed={selected}
      className={cn(
        "avatar-stage group text-left outline-none",
        compact ? "min-h-11" : "",
      )}
    >
      <span
        className={cn(
          "avatar-face relative block overflow-hidden rounded-lg border bg-raised",
          selected ? "border-accent ring-2 ring-accent/40" : "border-border",
        )}
      >
        <img
          src={profile.src}
          alt=""
          width={480}
          height={720}
          className={cn(
            "block w-full bg-raised object-cover object-top",
            compact ? "aspect-[3/4] max-h-28" : "aspect-[2/3]",
          )}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent px-2 pb-2 pt-8">
          <span className="block font-display text-sm font-semibold leading-tight">{profile.name}</span>
          <span className="mt-0.5 block text-[0.65rem] uppercase tracking-wide text-muted">
            {profile.age} · {profile.role}
          </span>
        </span>
      </span>
      {!compact && (
        <span className="mt-2 block text-xs text-muted">{profile.bio}</span>
      )}
    </button>
  );
}
