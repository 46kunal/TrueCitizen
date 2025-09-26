import * as React from "react";
import { Bell, AlertCircle, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Notification {
  id: number;
  type: 'update' | 'new_comment' | 'resolved' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, type: 'resolved', title: 'Issue Resolved: Pothole on MG Road', description: 'Your reported issue has been marked as resolved by the municipal corporation.', timestamp: '2 minutes ago', read: false },
  { id: 2, type: 'new_comment', title: 'New Comment on Streetlight Issue', description: 'Admin: We have assigned a team to fix the light.', timestamp: '1 hour ago', read: false },
  { id: 3, type: 'update', title: 'Status Update: Garbage Collection', description: 'The status of your garbage collection issue is now "Assigned".', timestamp: '5 hours ago', read: true },
  { id: 4, type: 'alert', title: 'City Alert: Heavy Rain Warning', description: 'Expect traffic delays and flooding in low-lying areas today.', timestamp: '1 day ago', read: true },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const iconProps = "h-5 w-5 flex-shrink-0";
  switch (type) {
    case 'resolved': return <CheckCircle className={cn(iconProps, "text-green-600")} />;
    case 'new_comment': return <MessageSquare className={cn(iconProps, "text-blue-500")} />;
    case 'update': return <Bell className={cn(iconProps, "text-orange-500")} />;
    case 'alert': return <AlertCircle className={cn(iconProps, "text-red-500")} />;
    default: return <Bell className={iconProps} />;
  }
};

interface NotificationSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NotificationSheet: React.FC<NotificationSheetProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Mock data fetching hook (replace with actual supabase logic later)
  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications')}
            {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount} {t('new')}
                </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-4 pb-2">
            <Button size="sm" variant="outline" className="w-full">
                {t('markAllAsRead')}
            </Button>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-4 pt-0 space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <Card 
                    key={notif.id} 
                    className={cn(
                        "p-3 flex items-start gap-3 cursor-pointer transition-colors",
                        !notif.read ? "bg-blue-50 border-blue-200" : "bg-card hover:bg-muted/50"
                    )}
                >
                  <NotificationIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold text-sm leading-tight", !notif.read && "text-foreground")}>{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{notif.description}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{notif.timestamp}</p>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center pt-8">{t('noNotifications')}</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};