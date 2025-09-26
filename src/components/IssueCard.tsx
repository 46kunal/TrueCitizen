import { MapPin, Clock, MessageSquare } from "lucide-react";
import { StatusChip } from "./ui/status-chip";
import { Card } from "./ui/card";
import React from "react";

interface IssueCardProps {
  title: string;
  description: string;
  location: string;
  status: "pending" | "assigned" | "resolved";
  image?: string;
  date: string;
  votes?: number;
  showVotes?: boolean;
  comments?: number;
}

const IssueCardComponent = ({
  title,
  description,
  location,
  status,
  image,
  date,
  votes,
  showVotes = false,
  comments = 0,
}: IssueCardProps) => {
  return (
    <Card className="gradient-card shadow-card p-4 transition-smooth hover:shadow-floating flex flex-col">
      <div className="flex gap-3 min-w-0">
        {image && (
          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
            <h3 className="font-semibold text-foreground leading-tight truncate">
              {title}
            </h3>
            <StatusChip status={status} />
          </div>

          {/* Description (2 lines max) */}
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {description}
          </p>

          {/* Footer: location + date/comments/votes */}
          <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{comments}</span>
              </div>
              {showVotes && votes !== undefined && (
                <span className="font-medium">↑ {votes}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const IssueCard = React.memo(IssueCardComponent);
