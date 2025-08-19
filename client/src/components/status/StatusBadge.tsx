import React from "react";
import clsx from "clsx";
import { STATUS_MAP, type StatusKey } from "./statusMap";

type Props = {
  status: StatusKey;
  label?: string;
  className?: string;
  size?: number; // px
};

export const StatusBadge: React.FC<Props> = ({
  status,
  label,
  className,
  size = 18,
}) => {
  const spec = STATUS_MAP[status];
  
  if (!spec) {
    // Fallback for unknown status
    return (
      <span className="text-gray-500 text-xs">
        {status}
      </span>
    );
  }
  
  const Icon = spec.Icon;

  // Specialized 'overdue' rendering: striped octagon background using CSS mask
  const overdueStripe =
    status === "overdue"
      ? {
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--badge-stripe) 0 6px, transparent 6px 12px)",
          WebkitMask:
            "radial-gradient(circle at center, #000 99%, #0000 100%)",
          borderRadius: 4,
        }
      : {};

  return (
    <span
      className={clsx("vs-badge", className)}
      style={{
        ["--badge-color" as any]: spec.color,
        ["--badge-stripe" as any]: spec.stripeColor || "transparent",
      }}
      aria-label={label || spec.label}
      title={label || spec.label}
    >
      <Icon className="vs-badge__icon" size={size} />
      <span className="vs-badge__text">{label ?? spec.label}</span>
      {status === "overdue" && (
        <span className="vs-badge__stripe" style={overdueStripe} />
      )}
    </span>
  );
};

export default StatusBadge;