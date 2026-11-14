import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Bell,
  Hourglass,
  Lock,
  Unlock,
  Users,
  Sparkles,
  Check
} from "lucide-react";
const NotificationsView = ({ onOpenCapsule }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.list();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifs();
  }, []);
  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };
  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };
  const getNotifIcon = (type) => {
    switch (type) {
      case "capsule_unlocked":
        return <Unlock className="w-5 h-5 text-emerald-400" />;
      case "capsule_sealed":
        return <Lock className="w-5 h-5 text-cyan-400" />;
      case "invitation_received":
        return <Users className="w-5 h-5 text-purple-400" />;
      case "capsule_unlocking_soon":
        return <Hourglass className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-pink-400" />;
    }
  };
  return <div className="max-w-4xl mx-auto space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Temporal Feed
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Notifications & Broadcasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Status updates regarding your scheduled unlocks, contributor invitations, and stasis events.
          </p>
        </div>

        {unreadCount > 0 && <button
    onClick={handleMarkAllRead}
    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1.5 self-start sm:self-auto"
  >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>}
      </div>

      {
    /* Notifications List */
  }
      {loading ? <div className="py-20 text-center text-xs text-slate-400">Loading temporal notifications...</div> : notifications.length > 0 ? <div className="space-y-3">
          {notifications.map((notif) => <div
    key={notif.id}
    onClick={() => {
      if (!notif.is_read) handleMarkAsRead(notif.id);
      if (notif.capsule_id) onOpenCapsule(notif.capsule_id);
    }}
    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 ${notif.is_read ? "bg-[#111827]/60 border-slate-800/80 text-slate-400" : "bg-gradient-to-r from-[#151B2D] to-[#111827] border-purple-500/40 text-white shadow-lg"}`}
  >
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                {notif.capsule_id && <span className="inline-block pt-1 text-[11px] text-cyan-400 font-semibold hover:underline">
                    View Capsule →
                  </span>}
              </div>

              {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0 mt-2" title="Unread" />}
            </div>)}
        </div> : <div className="py-20 text-center rounded-3xl bg-[#111827]/40 border border-slate-800 space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No notifications in register</h3>
          <p className="text-xs text-slate-400">
            You will be notified when your capsules unlock, contributors join, or reminders fire.
          </p>
        </div>}
    </div>;
};
export {
  NotificationsView
};
