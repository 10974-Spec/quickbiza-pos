import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Bell, Trash2, CheckCheck, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { notificationsAPI } from "@/services/api";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  action_url?: string;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      toast.success("Notification marked as read");
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsAPI.delete(id);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-success';
      case 'warning':
        return 'border-l-4 border-warning';
      case 'error':
        return 'border-l-4 border-destructive';
      case 'device':
        return 'border-l-4 border-info';
      default:
        return 'border-l-4 border-primary';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with system alerts and messages
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
              disabled={loading || notifications.every(n => n.is_read === 1)}
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="neo-card p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`neo-card p-4 ${getTypeStyles(notification.type)} ${notification.is_read === 0 ? 'bg-muted/50' : ''
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {notification.is_read === 0 && (
                          <span className="neo-badge bg-primary text-primary-foreground text-xs">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {notification.is_read === 0 && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="neo-button text-xs"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="neo-button text-xs bg-destructive text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Notifications;
