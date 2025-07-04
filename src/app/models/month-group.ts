import { GroupedByDA } from "./grouped-by-da";

export interface MonthGroup {
  month: string; // Ej: "julio de 2025"
  groupedByDA: GroupedByDA[];
}