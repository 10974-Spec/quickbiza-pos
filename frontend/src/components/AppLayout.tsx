import { ReactNode, useState, useEffect } from "react";
import { MainLayout } from "./MainLayout";
import { Smartphone, Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import NotificationPopup from "./NotificationPopup";
import { devicesAPI, notificationsAPI } from "@/services/api";
import { useModal } from "@/context/ModalContext";
import { useSync } from "@/context/SyncContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { openModal } = useModal();
  const [activeCount, setActiveCount] = useState(0);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [lastNotificationId, setLastNotificationId] = useState<number>(0);



  const fetchActiveCount = async () => {
    try {
      const data = await devicesAPI.getActiveCount();
      setActiveCount(data.count);
    } catch (error) {
      console.error('Error fetching active count:', error);
    }
  };

  useEffect(() => {
    // Initialize from localStorage
    const savedLastId = localStorage.getItem('lastNotificationId');
    if (savedLastId) {
      setLastNotificationId(parseInt(savedLastId));
    }
  }, []);

  const checkForNewNotifications = async () => {
    try {
      const notifications = await notificationsAPI.getAll();
      if (notifications.length > 0) {
        const latest = notifications[0];

        // Get fresh value from localStorage to handle cross-tab/remount sync
        const currentLastId = parseInt(localStorage.getItem('lastNotificationId') || '0');

        // Use a more robust check: 
        // 1. Must use an ID greater than what we've seen (localStorage)
        // 2. Must be unread
        // 3. Must not be the same as the one currently being shown (currentNotification?.id)
        if (latest.id > currentLastId && latest.is_read === 0 && (!currentNotification || latest.id !== currentNotification.id)) {
          console.log(`New notification detected: ${latest.id} > ${currentLastId}`);
          setCurrentNotification(latest);
          setLastNotificationId(latest.id);
          localStorage.setItem('lastNotificationId', latest.id.toString());
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    fetchActiveCount();
    checkForNewNotifications(); // initial check

    const deviceInterval = setInterval(fetchActiveCount, 30000); // Update every 30 seconds
    const notificationInterval = setInterval(checkForNewNotifications, 5000); // Check every 5 seconds

    return () => {
      clearInterval(deviceInterval);
      clearInterval(notificationInterval);
    };
  }, []); // Remove dependency on lastNotificationId to avoid re-setting intervals needlessly



  const handleCloseNotification = () => {
    setCurrentNotification(null);
    // Ensure we don't show this one again even if is_read is 0
    if (currentNotification) {
      localStorage.setItem('lastNotificationId', Math.max(
        parseInt(localStorage.getItem('lastNotificationId') || '0'),
        currentNotification.id
      ).toString());
    }
  };

  const handleViewNotification = async () => {
    if (currentNotification) {
      try {
        await notificationsAPI.markAsRead(currentNotification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setCurrentNotification(null);
  };

  const { isOnline, syncStatus, pendingCount, triggerSync } = useSync();

  // Badge config
  const badge = {
    synced: { label: 'Synced', icon: Wifi, cls: 'bg-green-100 text-green-700 border-green-200' },
    syncing: { label: 'Syncing…', icon: RefreshCw, cls: 'bg-blue-100 text-blue-700 border-blue-200 animate-spin-slow' },
    offline: { label: 'Offline', icon: WifiOff, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    error: { label: 'Sync Error', icon: AlertCircle, cls: 'bg-red-100 text-red-700 border-red-200' },
    idle: { label: 'Local', icon: Wifi, cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }[syncStatus] ?? { label: 'Local', icon: Wifi, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  const BadgeIcon = badge.icon;

  return (
    <MainLayout>
      {/* Sync status badge — fixed top-right */}
      <div className="fixed top-3 right-4 z-50">
        <button
          onClick={triggerSync}
          title={pendingCount ? `${pendingCount} record(s) pending sync — click to sync now` : 'Sync status'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${badge.cls}`}
        >
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
          {pendingCount > 0 && (
            <span className="ml-1 bg-current/20 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{pendingCount}</span>
          )}
        </button>
      </div>

      {children}

      <NotificationPopup
        notification={currentNotification}
        onClose={handleCloseNotification}
        onView={handleViewNotification}
      />

      <div className="mt-8 text-center pb-4">
        <p className="text-xs text-muted-foreground font-medium">
          &copy; 2026 Developed and managed by Nemtel Systems
        </p>
      </div>
    </MainLayout>
  );
}
