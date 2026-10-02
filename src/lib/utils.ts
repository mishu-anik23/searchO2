import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(n: number): string {
  const rounded = Math.max(0, Math.round(n));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatKg(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)} t`;
  return `${Math.round(n)} kg`;
}

export function formatKm(km: number): string {
  const n = Math.max(0, km);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 20_000_000 ? 0 : 1)} million km`;
  return `${Math.round(n).toLocaleString("en-US")} km`;
}

export function formatEta(hours: number): string {
  const h = Math.max(0, hours);
  if (h < 0.05) return "on final";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 24) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh}h ${mm}m` : `${hh}h`;
  }
  const days = Math.floor(h / 24);
  const rem = Math.round(h - days * 24);
  if (days >= 60) {
    const months = Math.floor(days / 30);
    const d = days - months * 30;
    return d ? `${months} mo ${d}d` : `${months} mo`;
  }
  return rem ? `${days}d ${rem}h` : `${days}d`;
}
