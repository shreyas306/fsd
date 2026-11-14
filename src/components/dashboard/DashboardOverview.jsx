import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import {
  Hourglass,
  Lock,
  Unlock,
  Image as ImageIcon,
  HardDrive,
  Clock,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Eye
} from "lucide-react";
const DashboardOverview = ({ onNavigate, onOpenCapsule }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingUnlocks, setUpcomingUnlocks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myCapsules, setMyCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({});
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, capRes] = await Promise.all([
        api.dashboard.getStats(),
        api.capsules.list({ sort: "newest" })
      ]);
      setStats(dashRes.stats);
      setUpcomingUnlocks(dashRes.upcomingUnlocks);
      setRecentActivity(dashRes.recentActivity);
      setMyCapsules(capRes.capsules.slice(0, 4));
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15e3);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = {};
      const now = Date.now();
      upcomingUnlocks.forEach((c) => {
        const diff = Math.max(0, new Date(c.unlock_at).getTime() - now);
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1e3 * 60 * 60) % 24);
        const mins = Math.floor(diff / 1e3 / 60 % 60);
        const secs = Math.floor(diff / 1e3 % 60);
        updated[c.id] = { days, hours, mins, secs };
      });
      setTimeRemaining(updated);
    }, 1e3);
    return () => clearInterval(timer);
  }, [upcomingUnlocks]);
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1e3) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };
  return <div className="space-y-8">
      {
    /* Welcome & Top Bar */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#151B2D] via-[#111827] to-[#0D1220] border border-purple-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Temporal Keeper Dashboard</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.full_name || "Keeper"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Your memories are waiting to be preserved. All vaults are synchronized and monitored.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
    onClick={() => onNavigate("/dashboard/capsules/create")}
    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
  >
            <PlusCircle className="w-4 h-4" />
            <span>Seal New Capsule</span>
          </button>
        </div>
      </div>

      {
    /* 4 Primary Statistics Cards from Database */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/80 border border-purple-500/20 shadow-lg relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Capsules</span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {loading ? "..." : stats?.totalCapsules ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Preserved in archive</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/80 border border-cyan-500/20 shadow-lg relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sealed in Stasis</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-cyan-400">
            {loading ? "..." : stats?.sealedCapsules ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Locked until target date</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/80 border border-emerald-500/20 shadow-lg relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unlocked Capsules</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-400">
            {loading ? "..." : stats?.unlockedCapsules ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ready to reopen & celebrate</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/80 border border-pink-500/20 shadow-lg relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Memories</span>
            <div className="p-2 rounded-xl bg-pink-950/80 border border-pink-500/30 text-pink-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-pink-400">
            {loading ? "..." : stats?.totalMemories ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Photos, audio, letters</p>
        </div>
      </div>

      {
    /* Grid: Upcoming Unlocks Countdown & Storage Meter */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {
    /* Widget 1 & 6: Upcoming Capsule Unlocks (Countdown Cards) */
  }
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-white">Upcoming Destination Unlocks</h3>
            </div>
            <button
    onClick={() => onNavigate("/dashboard/capsules")}
    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
  >
              View All Capsules
            </button>
          </div>

          {upcomingUnlocks.length > 0 ? <div className="space-y-4">
              {upcomingUnlocks.map((cap) => {
    const t = timeRemaining[cap.id] || { days: 0, hours: 0, mins: 0, secs: 0 };
    return <div
      key={cap.id}
      className="p-4 rounded-2xl bg-[#151B2D] border border-purple-500/20 hover:border-cyan-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
                    <div className="flex items-center space-x-3.5">
                      <img
      src={cap.cover_image}
      alt=""
      className="w-14 h-14 rounded-xl object-cover border border-purple-500/30"
    />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{cap.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950 text-purple-300 border border-purple-500/20">
                            {cap.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{cap.description}</p>
                        <p className="text-[11px] text-cyan-400/80 mt-1 font-mono">
                          Target: {new Date(cap.unlock_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {
      /* Countdown Badges */
    }
                    <div className="flex items-center space-x-2 font-mono text-center">
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="block text-sm font-bold text-white">{t.days}</span>
                        <span className="text-[9px] uppercase text-slate-500">Days</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="block text-sm font-bold text-cyan-400">{String(t.hours).padStart(2, "0")}</span>
                        <span className="text-[9px] uppercase text-slate-500">Hrs</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="block text-sm font-bold text-purple-400">{String(t.mins).padStart(2, "0")}</span>
                        <span className="text-[9px] uppercase text-slate-500">Min</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="block text-sm font-bold text-pink-400">{String(t.secs).padStart(2, "0")}</span>
                        <span className="text-[9px] uppercase text-slate-500">Sec</span>
                      </div>
                    </div>
                  </div>;
  })}
            </div> : <div className="py-10 text-center space-y-3">
              <Hourglass className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No sealed capsules currently ticking down.</p>
              <button
    onClick={() => onNavigate("/dashboard/capsules/create")}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
  >
                Create and Seal a Capsule
              </button>
            </div>}
        </div>

        {
    /* Widget 4: Memory Storage Usage */
  }
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-4 mb-4">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <h3 className="font-heading font-bold text-base text-white">Vault Storage Consumption</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Consumed Storage:</span>
                <span className="font-mono font-bold text-white">{formatBytes(stats?.totalStorageBytes || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Vault Capacity Limit:</span>
                <span className="font-mono text-slate-400">1.0 GB Free Tier</span>
              </div>

              {
    /* Progress bar */
  }
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
    style={{
      width: `${Math.min(100, Math.max(3, (stats?.totalStorageBytes || 0) / (1024 * 1024 * 1024) * 100))}%`
    }}
  />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Vault media stored in secure encrypted buckets with signed URL download protection.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
    onClick={() => onNavigate("/pricing")}
    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center justify-center space-x-1"
  >
              <span>Upgrade to Cosmic Voyager (25 GB)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {
    /* Grid: Recently Created Capsules & Recent Activity Audit */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {
    /* Widget 2: Recently Created Capsules */
  }
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="font-heading font-bold text-base text-white">Recent Vault Records</h3>
            <button
    onClick={() => onNavigate("/dashboard/capsules")}
    className="text-xs text-cyan-400 hover:underline font-semibold"
  >
              Manage All
            </button>
          </div>

          {myCapsules.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCapsules.map((cap) => <div
    key={cap.id}
    className="p-4 rounded-2xl bg-[#151B2D] border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
  >
                  <div className="flex items-center space-x-3">
                    <img src={cap.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white truncate">{cap.title}</h4>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cap.status === "unlocked" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : cap.status === "sealed" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/30" : "bg-amber-950 text-amber-400 border border-amber-500/30"}`}>
                        {cap.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>{cap.category}</span>
                    {cap.status === "unlocked" ? <button
    onClick={() => onOpenCapsule(cap.id)}
    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
  >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button> : <button
    onClick={() => onNavigate(`/dashboard/capsules`)}
    className="text-cyan-400 hover:text-cyan-300 font-semibold"
  >
                        Details
                      </button>}
                  </div>
                </div>)}
            </div> : <div className="py-8 text-center text-xs text-slate-500">
              No capsules recorded yet.
            </div>}
        </div>

        {
    /* Widget 3: Recent Activity Audit Trail */
  }
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="font-heading font-bold text-base text-white">Chronological Activity</h3>
            <span className="text-[10px] uppercase font-mono text-slate-500">Live Audit</span>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((act) => <div key={act.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-[11px]">{act.action}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{act.details}</p>
                </div>) : <div className="py-8 text-center text-xs text-slate-500">
                Audit logs will appear as actions take place.
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export {
  DashboardOverview
};
