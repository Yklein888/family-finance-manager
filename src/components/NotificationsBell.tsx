import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, ExternalLink } from "lucide-react";
import { getUserNotifications, markAsRead, deleteNotification } from "@/lib/smart-notifications";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const PRIORITY_COLORS = {
  high: "text-red-500 bg-red-50 border-red-200",
  medium: "text-orange-500 bg-orange-50 border-orange-200",
  low: "text-blue-500 bg-blue-50 border-blue-200",
};

const PRIORITY_ICONS = {
  high: "🚨",
  medium: "⚠️",
  low: "💡",
};

export default function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getUserNotifications(user?.id || "", 10),
    enabled: !!user,
    refetchInterval: 60000, // כל דקה
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    for (const notification of notifications) {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
    }
    refetch();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">התראות</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} לא נקראו
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">אין התראות חדשות</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors",
                    !notification.is_read && "bg-accent/20"
                  )}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">
                      {PRIORITY_ICONS[notification.priority as keyof typeof PRIORITY_ICONS]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            PRIORITY_COLORS[notification.priority as keyof typeof PRIORITY_COLORS]
                          )}
                        >
                          {notification.priority === 'high' && 'דחוף'}
                          {notification.priority === 'medium' && 'בינוני'}
                          {notification.priority === 'low' && 'רגיל'}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString('he-IL')}
                        </span>

                        {notification.action_url && (
                          <Link
                            to={notification.action_url}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen(false);
                            }}
                            className="mr-auto text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {notification.action_text || 'פתח'}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full"
              onClick={() => setOpen(false)}
            >
              סגור
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
