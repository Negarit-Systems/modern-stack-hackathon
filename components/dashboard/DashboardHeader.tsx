"use client";

import { Id } from "@/convex/_generated/dataModel";
import { UserPlus, Download, Bell, Check } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  session: any;
  collaborators: any[];
  onInvite: () => void;
  onExport: () => void;
  notifications: any[];
  onNotificationRead: (args: {id: Id<"notifications">; updates: any}) => void;
  onNotificationReadAll: (args: {ids: Id<"notifications">[]; updates: any}) => void;
}

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

export default function DashboardHeader({
  session,
  collaborators,
  onInvite,
  onExport,
  notifications,
  onNotificationRead,
  onNotificationReadAll
}: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = (notificationId: Id<"notifications">) => {
    onNotificationRead({
      id: notificationId,
      updates: { read: true }
    });
  };

  const handleMarkAllAsRead = () => {
    onNotificationReadAll({
      ids: notifications.filter(n => !n.read).map(n => n._id),
      updates: { read: true }
    });
    setShowNotifications(false);
  };

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-balance">{session?.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>Research Session • {session?._creationTime ? new Date(session._creationTime).toLocaleDateString() : 'Unknown date'}</span>
            <span>Auto-saved • Last sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Collaborators */}
          <div className="flex items-center gap-2">
            {collaborators.map((collab) => {
              const firstChar = collab.name?.[0]?.toUpperCase() || "A";
              const colorIndex = (firstChar.charCodeAt(0) - 65) % colors.length;
              const circleColor = colors[colorIndex];

              return (
                <div
                  key={collab._id}
                  className="relative flex items-center gap-1 group"
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-sm ${circleColor} cursor-pointer`}
                  >
                    {firstChar}
                  </div>
                  <div className="absolute left-0 top-8 z-10 hidden group-hover:flex flex-col bg-card border border-border rounded-md px-3 py-2 shadow-lg min-w-max">
                    <span className="font-semibold">{collab.name}</span>
                    <span className="text-muted-foreground text-xs">{collab.email}</span>
                  </div>
                </div>
              );
            })}
          </div>

                    {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Bell size={20} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-lg shadow-lg">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary hover:text-primary/60 flex items-center gap-1"
                      >
                        <Check size={14} />
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.read ? 'bg-blue-500' : 'bg-transparent'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-small mb-1">
                                {notification.message}
                              </p>
                                {notification.details && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {notification.details.length > 30
                                  ? notification.details.slice(0, 30) + "..."
                                  : notification.details}
                                </p>
                                )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground capitalize">
                                  {notification.type.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification._creationTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} className="text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <button
            onClick={onInvite}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
          >
            <UserPlus size={16} />
            Invite
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}