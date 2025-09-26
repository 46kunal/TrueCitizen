import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusChipVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-smooth",
  {
    variants: {
      status: {
        pending: "bg-status-pending text-status-pending-foreground",
        assigned: "bg-status-assigned text-status-assigned-foreground", 
        resolved: "bg-status-resolved text-status-resolved-foreground",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

interface StatusChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusChipVariants> {
  status: "pending" | "assigned" | "resolved";
}

const StatusChip = ({ className, status, children, ...props }: StatusChipProps) => {
  const statusText = status === "pending" ? "Pending" : status === "assigned" ? "Assigned" : "Resolved";
  
  return (
    <div className={cn(statusChipVariants({ status }), className)} {...props}>
      {children || statusText}
    </div>
  );
};

export { StatusChip, statusChipVariants };