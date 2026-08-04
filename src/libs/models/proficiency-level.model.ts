export const PROFICIENCY_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const DEFAULT_PROFICIENCY_LEVEL: ProficiencyLevel = "B1";
