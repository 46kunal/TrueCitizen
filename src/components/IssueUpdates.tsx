import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next"; // [MODIFIED] New Import

interface IssueUpdatesProps {
  status: "pending" | "assigned" | "resolved";
  createdAt: string;
}

// Maps status to the latest visible event in the timeline
const statusTimeline = {
  pending: [
    "Reported issue.",
  ],
  assigned: [
    "Reported issue.",
    "Assigned to Public Works Department.",
  ],
  resolved: [
    "Reported issue.",
    "Assigned to Public Works Department.",
    "Issue resolved and confirmed.",
  ],
};

export const IssueUpdates = ({ status, createdAt }: IssueUpdatesProps) => {
  const { t } = useTranslation(); // [MODIFIED] New Hook
  const timelineEvents = statusTimeline[status] || statusTimeline.pending;
  const reportedDate = new Date(createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="mt-4 p-4 rounded-lg bg-white/70 shadow-inner space-y-2 text-sm">
      <h3 className="font-bold text-foreground">{t('updates')}</h3> {/* [MODIFIED] Translation */}
      
      <div className="space-y-1">
        {timelineEvents.map((event, index) => {
          let prefix = "";
          
          // Use the actual creation date for the first event
          if (index === 0) {
            prefix = `${reportedDate}: `;
          } else {
            // For simplicity, we'll use a placeholder date for subsequent auto-generated steps
            prefix = `(Admin Update): `;
          }

          return (
            <p key={index} className={cn(
              "text-muted-foreground",
              index === timelineEvents.length - 1 && "font-semibold text-primary"
            )}>
              {prefix}
              {event}
            </p>
          );
        })}
      </div>
      
      {/* Optional Placeholder for next scheduled step, mimicking the screenshot */}
      {status === 'assigned' && (
        <p className="text-sm italic text-gray-600 border-t pt-2 mt-2">
          Scheduled: Scheduled for final inspection next week.
        </p>
      )}
    </div>
  );
};