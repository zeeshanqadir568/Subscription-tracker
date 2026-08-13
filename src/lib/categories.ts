export const CATEGORIES = [
  "Dev Tools",
  "Hosting & Infra",
  "Marketing",
  "Design",
  "Productivity",
  "Finance & Ops",
  "Communication",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Validated categorical palette (CVD-safe adjacent-pair order). Colors are
// assigned by fixed category position, not by sorted rank, so a category's
// color never changes as spending shifts which category leads.
const CATEGORY_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export function getCategoryColor(category: string): string {
  const index = CATEGORIES.indexOf(category as Category);
  return CATEGORY_COLORS[
    index >= 0 ? index % CATEGORY_COLORS.length : CATEGORY_COLORS.length - 1
  ];
}
