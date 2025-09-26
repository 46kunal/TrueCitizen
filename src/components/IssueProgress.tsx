import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { CheckCircle } from "lucide-react";

interface IssueProgressProps {
  status: "pending" | "assigned" | "resolved";
}

const statusMap = {
  pending: { label: "Pending", value: 0, showCheck: false },
  assigned: { label: "In progress", value: 50, showCheck: true }, // Assigned status is "In progress"
  resolved: { label: "Resolved", value: 100, showCheck: true },
};

export const IssueProgress = ({ status }: IssueProgressProps) => {
  const progressData = statusMap[status] || statusMap.pending;
  const progressValue = progressData.value;

  return (
    <div className="mt-2 mb-4 p-4 rounded-lg bg-white/70 shadow-inner">
      {/* Visual Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden mb-4">
        <Progress value={progressValue} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
      </div>

      {/* Status Labels */}
      <div className="flex justify-between text-center text-sm font-medium">
        {/* Pending Stage */}
        <div className={cn("flex-1", status === "pending" ? "text-primary" : "text-muted-foreground")}>
          Pending
        </div>

        {/* In Progress Stage (Assigned) */}
        <div 
          className={cn(
            "flex-1 flex flex-col items-center",
            (status === "assigned" || status === "resolved") ? "text-primary" : "text-muted-foreground"
          )}
        >
          {(status === "assigned" || status === "resolved") && (
            <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
          )}
          In progress
        </div>

        {/* Resolved Stage */}
        <div 
          className={cn(
            "flex-1 flex flex-col items-center",
            status === "resolved" ? "text-primary" : "text-muted-foreground"
          )}
        >
          {status === "resolved" && (
            <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
          )}
          Resolved
        </div>
      </div>
    </div>
  );
};