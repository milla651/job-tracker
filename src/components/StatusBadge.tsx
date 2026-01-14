import { cn, STATUS_CONFIG } from "@/lib/utils";
import { JobStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: JobStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.color,
        sizes[size]
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
