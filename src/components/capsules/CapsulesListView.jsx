import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Hourglass,
  Lock,
  Unlock,
  Archive,
  Search,
  PlusCircle,
  LayoutGrid,
  List,
  Share2,
  Trash2,
  Eye,
  Edit
} from "lucide-react";
const CATEGORIES = [
  "all",
  "Personal",
  "Friendship",
  "Family",
  "Love",
  "Travel",
  "Education",
  "Graduation",
  "Birthday",
  "Special Moments",
  "Other"
];
const CapsulesListView = ({
  onNavigate,
  onOpenCapsule,
  onInviteModal
}) => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [rescheduleMsg, setRescheduleMsg] = useState(null);
  const fetchCapsules = async () => {
    try {
      setLoading(true);
      const res = await api.capsules.list({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
        sort: sortOption
      });
      setCapsules(res.capsules);
    } catch (err) {
      console.error("Error fetching capsules:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCapsules();
  }, [statusFilter, categoryFilter, sortOption]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCapsules();
  };
  const handleArchive = async (id) => {
    try {
      await api.capsules.archive(id);
      fetchCapsules();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const handleDelete = async (id, title) => {
    if (confirm(`Are you certain you want to erase "${title}" from the stasis archives?`)) {
      try {
        await api.capsules.delete(id);
        fetchCapsules();
      } catch (err) {
        if (err instanceof Error) alert(err.message);
      }
    }
  };
  const handleForceUnlockTest = async (id) => {
    try {
      await api.capsules.forceUnlock(id);
      fetchCapsules();
      alert("Vault stasis release confirmed. Capsule is now Unlocked!");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const submitReschedule = async () => {
    if (!rescheduleTarget || !newDateInput) return;
    try {
      await api.capsules.reschedule(rescheduleTarget.id, newDateInput);
      setRescheduleMsg("Capsule rescheduled successfully.");
      setTimeout(() => {
        setRescheduleTarget(null);
        setRescheduleMsg(null);
        fetchCapsules();
      }, 1e3);
    } catch (err) {
      if (err instanceof Error) setRescheduleMsg(err.message);
    }
  };
  return <div className="space-y-6">
      {
    /* Top Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Vault Registry
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            My Time Capsules
          </h1>
        </div>

        <button
    onClick={() => onNavigate("/dashboard/capsules/create")}
    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg flex items-center space-x-2 self-start sm:self-auto"
  >
          <PlusCircle className="w-4 h-4" />
          <span>Forge New Capsule</span>
        </button>
      </div>

      {
    /* Filter and Search Bar */
  }
      <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {
    /* Search Input */
  }
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
    type="text"
    placeholder="Search by title or story..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
          </form>

          {
    /* Controls Right */
  }
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end overflow-x-auto">
            {
    /* Sort Selector */
  }
            <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
  >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="unlock_soon">Sort: Unlock Soonest</option>
            </select>

            {
    /* Grid / List toggle */
  }
            <div className="flex rounded-xl bg-slate-900 border border-slate-700 p-0.5">
              <button
    onClick={() => setViewMode("grid")}
    className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-purple-900/60 text-white" : "text-slate-400"}`}
    title="Grid view"
  >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
    onClick={() => setViewMode("list")}
    className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-purple-900/60 text-white" : "text-slate-400"}`}
    title="List view"
  >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {
    /* Status Tabs */
  }
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {[
    { id: "all", label: "All Vaults" },
    { id: "sealed", label: "🔒 Sealed in Stasis" },
    { id: "unlocked", label: "✨ Unlocked" },
    { id: "draft", label: "📝 Drafts" },
    { id: "archived", label: "📦 Archived" }
  ].map((tab) => <button
    key={tab.id}
    onClick={() => setStatusFilter(tab.id)}
    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${statusFilter === tab.id ? "bg-purple-950/80 text-cyan-300 border border-purple-500/40 shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
  >
              {tab.label}
            </button>)}
        </div>
      </div>

      {
    /* Capsule Content (Grid or List) */
  }
      {loading ? <div className="py-20 text-center text-xs text-slate-400">Loading temporal registers...</div> : capsules.length > 0 ? <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {capsules.map((cap) => {
    const isUnlocked = cap.status === "unlocked";
    const isSealed = cap.status === "sealed";
    const isDraft = cap.status === "draft";
    const targetDate = new Date(cap.unlock_at);
    return <div
      key={cap.id}
      className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-purple-500/30 transition-all shadow-xl overflow-hidden flex flex-col justify-between"
    >
                {
      /* Cover & Badges */
    }
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={cap.cover_image} alt="" className="w-full h-full object-cover" />
                  
                  {
      /* Status badge */
    }
                  <div className="absolute top-3 right-3">
                    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center space-x-1 ${isUnlocked ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/40" : isSealed ? "bg-cyan-950/90 text-cyan-300 border border-cyan-500/40" : "bg-amber-950/90 text-amber-300 border border-amber-500/40"}`}
    >
                      {isUnlocked && <Unlock className="w-3 h-3" />}
                      {isSealed && <Lock className="w-3 h-3" />}
                      <span>{cap.status}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/70 text-slate-200">
                    {cap.category} • {cap.visibility}
                  </div>
                </div>

                {
      /* Body Details */
    }
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white line-clamp-1">{cap.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cap.description || "No description"}</p>
                  </div>

                  {
      /* Target arrival details */
    }
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Arrival Target:</span>
                      <span className="font-mono text-cyan-400 font-bold">{targetDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Deposited Memories:</span>
                      <span className="text-white font-bold">{cap.memory_count ?? 0}</span>
                    </div>
                  </div>

                  {
      /* Action buttons */
    }
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isUnlocked ? <button
      onClick={() => onOpenCapsule(cap.id)}
      className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-90 flex items-center space-x-1.5 shadow-md"
    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Capsule</span>
                      </button> : isDraft ? <button
      onClick={() => onNavigate(`/dashboard/capsules/create`)}
      className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-500 flex items-center space-x-1"
    >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit & Seal</span>
                      </button> : <div className="flex items-center space-x-2">
                        <button
      onClick={() => onOpenCapsule(cap.id)}
      className="px-3 py-1.5 rounded-xl font-bold bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 flex items-center space-x-1.5 text-xs transition-all"
      title="Inspect Stasis Field & Live Countdown"
    >
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Stasis</span>
                        </button>
                        <button
      onClick={() => {
        setRescheduleTarget(cap);
        setNewDateInput(cap.unlock_at.slice(0, 16));
      }}
      className="px-2 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white"
      title="Reschedule arrival date"
    >
                          Reschedule
                        </button>
                      </div>}

                    <div className="flex items-center space-x-1">
                      <button
      onClick={() => onInviteModal(cap.id)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      title="Invite contributors"
    >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
      onClick={() => handleArchive(cap.id)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
      title={cap.is_archived ? "Unarchive" : "Archive"}
    >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
      onClick={() => handleDelete(cap.id, cap.title)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
      title="Delete capsule"
    >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>;
  })}
        </div> : <div className="py-20 text-center rounded-3xl bg-[#111827]/40 border border-slate-800 space-y-4">
          <Hourglass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No capsules matching your parameters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to preserve your current thoughts, voice notes, and photos for the future?
          </p>
          <button
    onClick={() => onNavigate("/dashboard/capsules/create")}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
  >
            Create Your First Capsule
          </button>
        </div>}

      {
    /* Reschedule Modal */
  }
      {rescheduleTarget && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reschedule Unlock Target</h3>
            <p className="text-xs text-slate-400">
              Update the designated arrival timestamp for "{rescheduleTarget.title}".
            </p>

            {rescheduleMsg && <p className="p-2 text-xs rounded-lg bg-purple-950 text-cyan-300 border border-purple-500/30">{rescheduleMsg}</p>}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Target Date & Time</label>
              <input
    type="datetime-local"
    value={newDateInput}
    onChange={(e) => setNewDateInput(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
  />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
    onClick={() => setRescheduleTarget(null)}
    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
  >
                Cancel
              </button>
              <button
    onClick={submitReschedule}
    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
  >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export {
  CapsulesListView
};
