/** Flight crew roster for HQ — Crewmark missions seat up to 3 specialists. */

export type CrewRole = "commander" | "pilot" | "systems" | "science" | "medical";

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  title: string;
  /** Short HQ blurb */
  blurb: string;
  /** One-line science / ops fact */
  fact: string;
  /** Skill tags shown on the card */
  skills: string[];
  /** Avatar palette (SVG fills) */
  skin: string;
  suit: string;
  accent: string;
  /** Hire cost once (program funds); commander is free */
  hireCost: number;
  /** Missions completed unlock hint */
  unlockAfterMissions: number;
}

export const CREW_ROSTER: CrewMember[] = [
  {
    id: "cmd-self",
    name: "You",
    role: "commander",
    title: "Flight director",
    blurb: "You run the program from HQ. On Crewmark flights you still sit the commander seat.",
    fact: "Mission control is a crew role too — every GO/NO-GO call is a human decision under time pressure.",
    skills: ["Leadership", "Checklist", "Budget"],
    skin: "#e8c4a8",
    suit: "#2a3344",
    accent: "#7eb8c9",
    hireCost: 0,
    unlockAfterMissions: 0,
  },
  {
    id: "pilot-nova",
    name: "Nova Reyes",
    role: "pilot",
    title: "Ascent / descent pilot",
    blurb: "Hands on the stick for Max-Q and the last kilometres of powered descent.",
    fact: "Pilots train for engine-out and abort modes long before they ever see a real flame trench.",
    skills: ["PDI", "Abort", "RCS"],
    skin: "#c9956c",
    suit: "#1a222e",
    accent: "#c9a86f",
    hireCost: 45_000,
    unlockAfterMissions: 0,
  },
  {
    id: "sys-kade",
    name: "Kade Okonkwo",
    role: "systems",
    title: "Vehicle systems",
    blurb: "Watches power, thermal, and propellant margins from the capsule screens.",
    fact: "In vacuum there is no “outside air” to cool the stack — radiators and careful power budgets do the work.",
    skills: ["Power", "Thermal", "Propellant"],
    skin: "#8d6e4c",
    suit: "#131820",
    accent: "#6fbf9a",
    hireCost: 38_000,
    unlockAfterMissions: 0,
  },
  {
    id: "sci-mira",
    name: "Mira Chen",
    role: "science",
    title: "ISRU science",
    blurb: "Owns the oxygen plant plan — ice, electrolysis, or MOXIE stacks.",
    fact: "Water is about 89% oxygen by mass. A bucket of polar ice is mostly breathable gas waiting for electricity.",
    skills: ["Electrolysis", "MOXIE", "Sampling"],
    skin: "#dbb89a",
    suit: "#243044",
    accent: "#9fd0d4",
    hireCost: 42_000,
    unlockAfterMissions: 1,
  },
  {
    id: "med-sol",
    name: "Dr. Sol Park",
    role: "medical",
    title: "Crew health",
    blurb: "Radiation, sleep, and the closed air loop when people are on board.",
    fact: "A person uses roughly 0.8 kg of oxygen a day. Three crew need a plant that keeps up — plus margin for leaks.",
    skills: ["Life support", "Radiation", "EVA prep"],
    skin: "#e0c2a0",
    suit: "#1e2836",
    accent: "#e8a0b8",
    hireCost: 40_000,
    unlockAfterMissions: 1,
  },
  {
    id: "pilot-jax",
    name: "Jax Moreau",
    role: "pilot",
    title: "Transfer pilot",
    blurb: "Specialist for long coasts and mid-course burns on Mars paths.",
    fact: "A Hohmann coast is months of quiet. The hard part is arriving with the right speed for capture.",
    skills: ["Hohmann", "Mid-course", "Nav"],
    skin: "#b08968",
    suit: "#18202c",
    accent: "#c4896a",
    hireCost: 55_000,
    unlockAfterMissions: 2,
  },
];

export const CREW_SEAT_LIMIT = 3;

export function crewById(id: string): CrewMember | undefined {
  return CREW_ROSTER.find((c) => c.id === id);
}

export function roleLabel(role: CrewRole): string {
  switch (role) {
    case "commander":
      return "Commander";
    case "pilot":
      return "Pilot";
    case "systems":
      return "Systems";
    case "science":
      return "Science";
    case "medical":
      return "Medical";
  }
}
