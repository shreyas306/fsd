import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Users,
  Mail,
  CheckCircle2,
  Eye
} from "lucide-react";
const SharedCapsulesView = ({
  onNavigate,
  onOpenCapsule,
  onOpenInviteModal
}) => {
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchShared = async () => {
    try {
      setLoading(true);
      const res = await api.collaboration.getShared();
      setSharedCapsules(res.sharedCapsules);
      setPendingInvitations(res.pendingInvitations);
    } catch (err) {
      console.error("Failed to load shared vaults:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShared();
  }, []);
  const handleAcceptInvite = async (token) => {
    try {
      await api.collaboration.acceptInvitation(token);
      alert("Invitation accepted! Capsule added to your collaborative circle.");
      fetchShared();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Collaborative Circles
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Shared Time Vaults
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Memory vaults you are collaborating on with friends, family, or colleagues.
        </p>
      </div>

      {
    /* Pending Invitations Section if any */
  }
      {pendingInvitations.length > 0 && <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Pending Capsule Invitations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingInvitations.map((inv) => <div
    key={inv.id}
    className="p-4 rounded-2xl bg-[#111827] border border-purple-500/30 flex items-center justify-between"
  >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{inv.capsule_title || "Collaborative Vault"}</h4>
                  <p className="text-[11px] text-slate-400">
                    Invited by {inv.inviter_name || "A Keeper"} as <span className="text-cyan-400 font-semibold">{inv.role}</span>
                  </p>
                </div>

                <button
    onClick={() => handleAcceptInvite(inv.token)}
    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold text-white hover:opacity-90 flex items-center space-x-1"
  >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
              </div>)}
          </div>
        </div>}

      {
    /* Shared Capsules List */
  }
      <div>
        <h3 className="font-heading font-bold text-lg text-white mb-4">
          Active Collaborations ({sharedCapsules.length})
        </h3>

        {loading ? <div className="py-20 text-center text-xs text-slate-400">Loading collaborative vaults...</div> : sharedCapsules.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedCapsules.map((cap) => <div
    key={cap.id}
    className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-purple-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl"
  >
                <div className="flex items-start space-x-3.5">
                  <img src={cap.cover_image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Your Role: {cap.member_role}
                    </span>
                    <h4 className="text-base font-bold text-white truncate">{cap.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{cap.description}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Status:</span>
                    <span className="font-bold text-white uppercase">{cap.status}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Unlocks On:</span>
                    <span className="font-mono text-cyan-400 font-bold">{new Date(cap.unlock_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{cap.memory_count ?? 0} memories</span>
                  {cap.status === "unlocked" ? <button
    onClick={() => onOpenCapsule(cap.id)}
    className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center space-x-1"
  >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Vault</span>
                    </button> : <span className="text-cyan-400 font-mono text-[11px]">Locked in Stasis</span>}
                </div>
              </div>)}
          </div> : <div className="py-20 text-center rounded-3xl bg-[#111827]/40 border border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No shared capsules yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When someone invites you to contribute to their time capsule, it will appear here.
            </p>
          </div>}
      </div>
    </div>;
};
export {
  SharedCapsulesView
};
