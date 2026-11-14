import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Shield,
  Users,
  Hourglass,
  AlertTriangle,
  Activity,
  Layers
} from "lucide-react";
const AdminPortalView = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, usersRes, capsRes, repRes] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getUsers(),
        api.admin.getCapsules(),
        api.admin.getReports()
      ]);
      setStats(overviewRes.stats);
      setLogs(overviewRes.recentLogs);
      setUsers(usersRes.users);
      setCapsules(capsRes.capsules);
      setReports(repRes.reports);
    } catch (err) {
      console.error("Failed to load admin telemetry:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAdminData();
  }, []);
  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.admin.toggleSuspendUser(userId);
      setUsers(
        (prev) => prev.map((u) => u.id === userId ? { ...u, is_suspended: res.is_suspended } : u)
      );
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const handleResolveReport = async (reportId, status) => {
    try {
      await api.admin.updateReport(reportId, status);
      setReports(
        (prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r)
      );
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const filteredUsers = users.filter(
    (u) => u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase())
  );
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              Platform Master Console
            </span>
            <h1 className="font-heading text-2xl font-extrabold text-white">
              Administrator Oversight & Security
            </h1>
          </div>
        </div>

        {
    /* Tab Switcher */
  }
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto">
          {[
    { id: "overview", label: "Overview", icon: Layers },
    { id: "users", label: "Keepers", icon: Users },
    { id: "capsules", label: "All Vaults", icon: Hourglass },
    { id: "reports", label: "Abuse Reports", icon: AlertTriangle, count: reports.filter((r) => r.status === "pending").length },
    { id: "logs", label: "Audit Trail", icon: Activity }
  ].map((tab) => <button
    key={tab.id}
    onClick={() => setActiveTab(tab.id)}
    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${activeTab === tab.id ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
  >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.count) && <span className="w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {tab.count}
                </span>}
            </button>)}
        </div>
      </div>

      {loading ? <div className="py-20 text-center text-xs text-slate-400">Querying platform database...</div> : <>
          {
    /* TAB 1: OVERVIEW & TELEMETRY */
  }
          {activeTab === "overview" && <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-[#111827] border border-cyan-500/20">
                  <span className="text-xs uppercase font-bold text-slate-400">Active Keepers</span>
                  <div className="text-3xl font-extrabold font-heading text-white mt-1">
                    {stats?.totalUsers}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Registered users</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111827] border border-purple-500/20">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Capsules</span>
                  <div className="text-3xl font-extrabold font-heading text-purple-400 mt-1">
                    {stats?.totalCapsules}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Sealed & unlocked</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111827] border border-emerald-500/20">
                  <span className="text-xs uppercase font-bold text-slate-400">Unlocked Vaults</span>
                  <div className="text-3xl font-extrabold font-heading text-emerald-400 mt-1">
                    {stats?.unlockedCapsules}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Arrived in present</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111827] border border-pink-500/20">
                  <span className="text-xs uppercase font-bold text-slate-400">Storage Used</span>
                  <div className="text-3xl font-extrabold font-heading text-pink-400 mt-1">
                    {((stats?.totalStorageBytes || 0) / (1024 * 1024)).toFixed(1)} MB
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Uploaded memories</p>
                </div>
              </div>

              {
    /* Recent Audit Logs */
  }
              <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
                <h3 className="font-heading font-bold text-base text-white">Recent Immutable Activity Logs</h3>
                <div className="space-y-2">
                  {logs.map((log) => <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                        <p className="text-slate-300">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>)}
                </div>
              </div>
            </div>}

          {
    /* TAB 2: USERS MANAGEMENT */
  }
          {activeTab === "users" && <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">Registered Keepers ({users.length})</h3>
                <input
    type="text"
    placeholder="Search users..."
    value={userSearch}
    onChange={(e) => setUserSearch(e.target.value)}
    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
  />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Capsules</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => <tr key={u.id} className="hover:bg-slate-900/50">
                        <td className="p-3 flex items-center space-x-2.5">
                          <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-white block">{u.full_name}</span>
                            <span className="text-slate-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{u.capsule_count}</td>
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {u.is_suspended ? <span className="text-red-400 font-bold">Suspended</span> : <span className="text-emerald-400 font-bold">Active</span>}
                        </td>
                        <td className="p-3 text-right">
                          {u.role !== "admin" && <button
    onClick={() => handleToggleSuspend(u.id)}
    className={`px-3 py-1 rounded-lg text-xs font-semibold ${u.is_suspended ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-red-950 text-red-400 border border-red-500/30"}`}
  >
                              {u.is_suspended ? "Restore" : "Suspend"}
                            </button>}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>}

          {
    /* TAB 3: ALL CAPSULES */
  }
          {activeTab === "capsules" && <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">All Platform Vaults ({capsules.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {capsules.map((cap) => <div key={cap.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={cap.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white text-xs">{cap.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Status: {cap.status.toUpperCase()} • {cap.visibility}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {new Date(cap.unlock_at).toLocaleDateString()}
                    </span>
                  </div>)}
              </div>
            </div>}

          {
    /* TAB 4: ABUSE REPORTS */
  }
          {activeTab === "reports" && <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">Community Moderation Reports ({reports.length})</h3>
              {reports.length > 0 ? <div className="space-y-3">
                  {reports.map((rep) => <div key={rep.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-red-400 uppercase">{rep.reason}</span>
                        <p className="text-xs text-white">Capsule: "{rep.capsule_title}"</p>
                        {rep.details && <p className="text-[11px] text-slate-400">Details: {rep.details}</p>}
                        <span className="text-[10px] text-slate-500 font-mono">Status: {rep.status}</span>
                      </div>
                      {rep.status === "pending" && <div className="flex items-center space-x-2">
                          <button
    onClick={() => handleResolveReport(rep.id, "resolved")}
    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
  >
                            Resolve & Keep Safe
                          </button>
                          <button
    onClick={() => handleResolveReport(rep.id, "dismissed")}
    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
  >
                            Dismiss
                          </button>
                        </div>}
                    </div>)}
                </div> : <p className="text-xs text-slate-500 py-6 text-center">No open abuse reports. All vaults compliant.</p>}
            </div>}

          {
    /* TAB 5: AUDIT TRAIL */
  }
          {activeTab === "logs" && <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white">Comprehensive System Audit Logs</h3>
              <div className="space-y-2">
                {logs.map((log) => <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between">
                    <div>
                      <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                      <p className="text-slate-300">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>)}
              </div>
            </div>}
        </>}
    </div>;
};
export {
  AdminPortalView
};
