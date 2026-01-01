import { Type, AlignLeft, Hash, Calendar, ToggleLeft, List } from "lucide-react";

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Short text",
  textarea: "Long text",
  number: "Number",
  date: "Date",
  boolean: "Yes / No",
  select: "Single choice",
  multiselect: "Multiple choice",
};

export const FIELD_TYPE_ICONS: Record<string, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
  select: List,
  multiselect: List,
};

export function getFieldTypeLabel(type: string): string {
  return FIELD_TYPE_LABELS[type] || type;
}

export function getFieldTypeIcon(type: string): typeof Type {
  return FIELD_TYPE_ICONS[type] || Type;
}
