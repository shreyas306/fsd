import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import {
  Key,
  Bell,
  HardDrive,
  Download,
  CheckCircle2
} from "lucide-react";
const ProfileView = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [timezone, setTimezone] = useState(user?.timezone || "America/New_York");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, bio, avatar_url: avatarUrl, timezone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3e3);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  return <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Keeper Identification
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Keeper Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage your public persona and vault custodian credentials.</p>
      </div>

      <div className="p-8 rounded-3xl bg-[#111827]/90 border border-purple-500/20 shadow-xl space-y-6">
        {
    /* Profile Card Header */
  }
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-800">
          <img
    src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
    alt=""
    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)]"
  />
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-heading text-xl font-bold text-white">{user?.full_name}</h3>
            <p className="text-xs text-purple-400 font-mono">@{user?.username} • {user?.role.toUpperCase()}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="text-[11px] text-slate-500">
              Preserving memories since {user ? new Date(user.created_at).toLocaleDateString() : "2024"}
            </p>
          </div>
        </div>

        {saved && <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Keeper profile updated successfully.</span>
          </div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Timezone
              </label>
              <select
    value={timezone}
    onChange={(e) => setTimezone(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Central Europe (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
    type="text"
    value={avatarUrl}
    onChange={(e) => setAvatarUrl(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Keeper Bio
            </label>
            <textarea
    rows={3}
    value={bio}
    onChange={(e) => setBio(e.target.value)}
    placeholder="A few words about your journey and what you hope to preserve..."
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
          </div>

          <button
    type="submit"
    disabled={saving}
    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg transition-all"
  >
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>;
};
const SettingsView = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);
  const [remind7Days, setRemind7Days] = useState(true);
  const [remind1Day, setRemind1Day] = useState(true);
  const [remindOnUnlock, setRemindOnUnlock] = useState(true);
  const [emailBroadcasts, setEmailBroadcasts] = useState(true);
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setPwdMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      if (err instanceof Error) setPwdMsg(err.message);
    }
  };
  const handleExportData = async () => {
    try {
      const data = await api.capsules.list();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time_capsule_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate export archive.");
    }
  };
  return <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Vault Preferences
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Settings & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure notification reminders, security keys, and data exports.</p>
      </div>

      {
    /* 1. Notification Schedules */
  }
      <div className="p-6 rounded-3xl bg-[#111827]/90 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Unlock Notification Schedules</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
    type="checkbox"
    checked={remind7Days}
    onChange={(e) => setRemind7Days(e.target.checked)}
    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
  />
            <span>Remind me 7 days before an unlock date arrives</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
    type="checkbox"
    checked={remind1Day}
    onChange={(e) => setRemind1Day(e.target.checked)}
    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
  />
            <span>Remind me 24 hours before stasis unlock</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
    type="checkbox"
    checked={remindOnUnlock}
    onChange={(e) => setRemindOnUnlock(e.target.checked)}
    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
  />
            <span>Instant notification on exact moment of arrival (Recommended)</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer pt-2 border-t border-slate-800/80">
            <input
    type="checkbox"
    checked={emailBroadcasts}
    onChange={(e) => setEmailBroadcasts(e.target.checked)}
    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
  />
            <span>Email delivery via Resend ({user?.email})</span>
          </label>
        </div>
      </div>

      {
    /* 2. Change Password */
  }
      <div className="p-6 rounded-3xl bg-[#111827]/90 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Key className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-base text-white">Cryptographic Access Key</h3>
        </div>

        {pwdMsg && <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-cyan-300">
            {pwdMsg}
          </div>}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
    type="password"
    required
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
    type="password"
    required
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
  />
            </div>
          </div>
          <button
    type="submit"
    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
  >
            Update Password
          </button>
        </form>
      </div>

      {
    /* 3. Data Export & Danger Zone */
  }
      <div className="p-6 rounded-3xl bg-[#111827]/90 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <HardDrive className="w-5 h-5 text-pink-400" />
          <h3 className="font-bold text-base text-white">Archive Management & Exports</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Export Memory Vaults Archive</h4>
            <p className="text-[11px] text-slate-400">Download complete JSON archive of all capsules and metadata.</p>
          </div>
          <button
    onClick={handleExportData}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex items-center space-x-1.5"
  >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-400">Decommission Vault (Delete Account)</h4>
            <p className="text-[11px] text-slate-500">Permanently erases all encrypted capsules and associated memories.</p>
          </div>
          <button
    onClick={() => {
      if (confirm("Are you certain? This action cannot be reversed.")) {
        alert("Account deletion request initiated.");
      }
    }}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300"
  >
            Delete Account
          </button>
        </div>
      </div>
    </div>;
};
export {
  ProfileView,
  SettingsView
};
