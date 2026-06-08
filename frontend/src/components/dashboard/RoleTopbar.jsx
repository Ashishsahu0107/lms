import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Search,
  Settings,
  Check,
  Trash2,
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  addNotification,
} from "../../redux/slices/notificationSlice";
import toast from "react-hot-toast";

export default function RoleTopbar({
  title,
  subtitle,
}) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { socket } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data) => {
      dispatch(addNotification(data));
      toast.success(`New Alert: ${data.title}`);
    };
    socket.on("newNotification", handleNewNotification);
    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, dispatch]);

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/80 backdrop-blur-xl">

      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-6">

        {/* LEFT */}
        <div>

          <h1 className="text-2xl font-bold text-base-content">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-base-content/60">
              {subtitle}
            </p>
          ) : null}

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <label className="input input-bordered hidden w-64 items-center gap-2 rounded-2xl md:flex">

            <Search className="h-4 w-4 opacity-60" />

            <input
              type="text"
              className="grow"
              placeholder="Search..."
            />

          </label>

          {/* Notification Popover Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn btn-circle btn-ghost relative hover:bg-base-200"
            >
              <Bell className="h-5 w-5 text-base-content" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-4 w-4 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-base-100/90 backdrop-blur-xl border border-base-300 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-base-300 pb-2">
                  <span className="font-bold text-sm text-base-content">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        dispatch(markAllNotificationsRead());
                        toast.success("All notifications marked as read");
                      }}
                      className="text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-64 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-base-content/50">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`flex gap-2.5 p-2 rounded-xl border border-base-300/50 hover:bg-base-200 transition-all ${
                          n.read ? "opacity-60" : "border-primary/20 bg-primary/5"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-base-content truncate">{n.title}</p>
                          <p className="text-[10px] text-base-content/70 leading-relaxed mt-0.5 break-words">{n.message}</p>
                          <span className="text-[9px] text-base-content/40 block mt-1">
                            {new Date(n.createdAt || n.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                          {!n.read && (
                            <button
                              onClick={() => dispatch(markNotificationRead(n._id))}
                              className="btn btn-xs btn-ghost btn-circle text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => dispatch(deleteNotification(n._id))}
                            className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/10 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="btn btn-circle btn-ghost">
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-3 py-2 shadow-sm">

            <div className="avatar placeholder">
              <div className="w-10 rounded-full bg-primary text-primary-content">
                <span className="font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-base-content">
                {user?.name || "LMS User"}
              </p>

              <p className="text-xs text-base-content/60 uppercase">
                {user?.role || "learner"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}