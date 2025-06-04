import React, { useEffect, useState } from "react";
import { useSocket } from "@/components/context/socketContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  userId: string;
  message: string;
  courseId?: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!socket) {
      console.log('[Notifications] No socket instance available');
      return;
    }

    console.log('[Notifications] Fetching initial notifications, page:', page);
    socket.emit("getNotifications", { page, limit });

    const handleNotifications = (data: { success: boolean; data: Notification[]; unreadCount: number }) => {
      console.log('[Notifications] Received notifications event:', data);
      if (data.success) {
        setNotifications((prev) => {
          const newNotifications = data.data;
          const uniqueNotifications = [
            ...newNotifications,
            ...prev.filter((p) => !newNotifications.some((n) => n._id === p._id)),
          ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          console.log('[Notifications] Updated notifications:', uniqueNotifications.length);
          return uniqueNotifications;
        });
        setUnreadCount(data.unreadCount);
      }
    };

    const handleNewNotification = (data: { success: boolean; data: Notification; unreadCount: number }) => {
      console.log('[Notifications] Received new notification:', data);
      if (data.success) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === data.data._id)) return prev;
          const updated = [data.data, ...prev].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          console.log('[Notifications] Added new notification, total:', updated.length);
          return updated;
        });
        setUnreadCount(data.unreadCount);
      }
    };

    socket.on("notifications", handleNotifications);
    socket.on("newNotification", handleNewNotification);
    socket.on("notificationRead", (data: { notificationId: string; unreadCount: number }) => {
      console.log('[Notifications] Notification read:', data);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === data.notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(data.unreadCount);
    });

    socket.on("allNotificationsRead", (data: { unreadCount: number }) => {
      console.log('[Notifications] All notifications read:', data);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(data.unreadCount);
    });

    return () => {
      console.log('[Notifications] Cleaning up socket listeners');
      socket.off("notifications", handleNotifications);
      socket.off("newNotification", handleNewNotification);
      socket.off("notificationRead");
      socket.off("allNotificationsRead");
    };
  }, [socket, page, limit]);

  const handleMarkAsRead = (notificationId: string) => {
    if (socket) {
      console.log('[Notifications] Marking notification as read:', notificationId);
      socket.emit("markNotificationRead", notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (socket) {
      console.log('[Notifications] Marking all notifications as read');
      socket.emit("markAllNotificationsRead");
    }
  };

  const loadMore = () => {
    console.log('[Notifications] Loading more notifications, page:', page + 1);
    setPage((prev) => prev + 1);
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-black/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-800/50 z-50 max-h-96 overflow-y-auto transition-all duration-300">
      <div className="p-4 border-b border-gray-800/50 flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">Notifications ({unreadCount})</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-[#49bbbd] text-sm hover:underline disabled:opacity-50"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm font-semibold"
            aria-label="Close notifications"
          >
            ✕
          </button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-400">No notifications</div>
      ) : (
        <ul className="divide-y divide-gray-800/50">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-4 hover:bg-white/5 transition-all duration-200 ${
                notification.isRead ? "opacity-75" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white text-sm">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-[#49bbbd] text-xs hover:underline ml-2"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {notifications.length >= page * limit && (
        <button
          onClick={loadMore}
          className="w-full p-2 text-center text-[#49bbbd] hover:text-white hover:bg-white/5 rounded-b-lg transition-all duration-200"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Notifications;