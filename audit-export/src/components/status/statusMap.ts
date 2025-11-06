import { type ComponentType } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Circle,
  CheckCircle2,
  Octagon
} from "lucide-react";

export type StatusKey =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "complete"
  | "pending"
  | "overdue";

export type StatusSpec = {
  label: string;
  color: string;
  Icon: ComponentType<{ className?: string }>;
  stripeColor?: string; // for 'overdue'
};

export const STATUS_MAP: Record<StatusKey, StatusSpec> = {
  critical: { label: "Critical", color: "#E53935", Icon: AlertOctagon },
  high: { label: "High", color: "#FB8C00", Icon: AlertTriangle },
  medium: { label: "Medium", color: "#FDD835", Icon: Clock },
  low: { label: "Low", color: "#43A047", Icon: Circle },
  complete: { label: "Complete", color: "#4CAF50", Icon: CheckCircle2 },
  pending: { label: "Pending", color: "#9E9E9E", Icon: Circle },
  overdue: {
    label: "Overdue",
    color: "#D32F2F",
    stripeColor: "#FDD835",
    Icon: Octagon
  }
};