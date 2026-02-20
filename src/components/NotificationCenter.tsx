import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

const NOTIFICATION_ICONS = {
  budget_warning: AlertCircle,
  budget_exceeded: AlertCircle,
  bill_reminder: Calendar,
  unusual_expense: TrendingUp,
  achievement: Award,
  savings_milestone: Target,
  prediction_alert: TrendingUp,
  maaser_reminder: Award,
  goal_progress: Target,
  streak_reminder: Flame,
};

const NOTIFICATION_COLORS = {
  budget_warning: "text-yellow-600 bg-yellow-50",
  budget_exceeded: "text-red-600 bg-red-50",
  bill_reminder: "text-blue-600 bg-blue-50",
  unusual_expense: "text-orange-600 bg-orange-50",
  achievement: "text-purple-600 bg-purple-50",
  savings_milestone: "text-green-600 bg-green-50",
  prediction_alert: "text-indigo-600 bg-indigo-50",
  maaser_reminder: "text-yellow-600 bg-yellow-50",
  goal_progress: "text-teal-600 bg-teal-50",
  streak_reminder: "text-orange-600 bg-orange-50",
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Count unread
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    for (const id of unreadIds) {
      await markAsReadMutation.mutateAsync(id);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="הודעות"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">התראות</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">אין התראות חדשות</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon =
                  NOTIFICATION_ICONS[
                    notification.type as keyof typeof NOTIFICATION_ICONS
                  ] || Bell;
                const colorClass =
                  NOTIFICATION_COLORS[
                    notification.type as keyof typeof NOTIFICATION_COLORS
                  ] || "text-gray-600 bg-gray-50";

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                      !notification.is_read && "bg-blue-50/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                          colorClass
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm font-medium",
                              !notification.is_read && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: he,
                              }
                            )}
                          </span>
                          {notification.action_text && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.action_text}
                            </Badge>
                          )}
                          {notification.priority === "high" && (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                            >
                              דחוף
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
