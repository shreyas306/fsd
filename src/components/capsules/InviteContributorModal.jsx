import { useState } from "react";
import { api } from "../../lib/api.js";
import { Mail, Copy, Check, Users } from "lucide-react";
const InviteContributorModal = ({ capsuleId, onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("contributor");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.collaboration.invite(capsuleId, { email, role });
      setGeneratedLink(`${window.location.origin}${res.invite_url}`);
      setMessage(`Invitation dispatched to ${email || "link generator"}.`);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-[#111827] border border-purple-500/30 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-white">Invite Keepers & Contributors</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="text-xs text-slate-400">
          Invite friends, partners, or family members to contribute memories, letters, and voice notes to this capsule before sealing.
        </p>

        {message && <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-cyan-300">
            {message}
          </div>}

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Invitee Email (Optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
    type="email"
    placeholder="friend@domain.com (or leave blank for share link)"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
  />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
    type="button"
    onClick={() => setRole("contributor")}
    className={`p-2.5 rounded-xl text-xs font-semibold border text-left ${role === "contributor" ? "border-purple-400 bg-purple-950/50 text-white" : "border-slate-800 bg-slate-900 text-slate-400"}`}
  >
                <span className="block font-bold">Contributor</span>
                <span className="text-[10px] text-slate-400">Can upload photos & letters</span>
              </button>

              <button
    type="button"
    onClick={() => setRole("viewer")}
    className={`p-2.5 rounded-xl text-xs font-semibold border text-left ${role === "viewer" ? "border-purple-400 bg-purple-950/50 text-white" : "border-slate-800 bg-slate-900 text-slate-400"}`}
  >
                <span className="block font-bold">Viewer</span>
                <span className="text-[10px] text-slate-400">Can view once unlocked</span>
              </button>
            </div>
          </div>

          <button
    type="submit"
    disabled={loading}
    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity"
  >
            {loading ? "Generating Invitation..." : "Generate Temporal Invitation"}
          </button>
        </form>

        {generatedLink && <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Shareable Temporal Access Link
            </span>
            <div className="flex items-center space-x-2">
              <input
    type="text"
    readOnly
    value={generatedLink}
    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono truncate"
  />
              <button
    type="button"
    onClick={copyToClipboard}
    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1"
  >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>}
      </div>
    </div>;
};
export {
  InviteContributorModal
};
