import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Compass,
  Search,
  Heart,
  Bookmark,
  AlertTriangle,
  Unlock,
  Eye,
  Flame,
  Clock
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
const ExploreView = ({ onOpenCapsule }) => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fetchExplore = async () => {
    try {
      setLoading(true);
      const res = await api.explore.list({
        category: categoryFilter,
        search: searchQuery,
        filter: activeTab
      });
      setCapsules(res.capsules);
    } catch (err) {
      console.error("Error fetching public capsules:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExplore();
  }, [categoryFilter, activeTab]);
  const handleLike = async (capsuleId) => {
    try {
      const res = await api.explore.toggleLike(capsuleId);
      setCapsules(
        (prev) => prev.map(
          (c) => c.id === capsuleId ? { ...c, is_liked: res.is_liked, likes_count: res.likes_count } : c
        )
      );
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const handleBookmark = async (capsuleId) => {
    try {
      const res = await api.explore.toggleBookmark(capsuleId);
      setCapsules(
        (prev) => prev.map((c) => c.id === capsuleId ? { ...c, is_bookmarked: res.is_bookmarked } : c)
      );
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportTarget) return;
    try {
      await api.explore.report(reportTarget.id, { reason: reportReason, details: reportDetails });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportTarget(null);
        setReportDetails("");
      }, 2e3);
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  return <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {
    /* Hero Header */
  }
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 animate-spin" />
          <span>Public Unlocked Vaults</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Explore Timeless Stories
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Peer into authentic capsules unlocked by travelers around the globe. Only explicitly public, unlocked vaults appear here.
        </p>
      </div>

      {
    /* Filter and Tab Bar */
  }
      <div className="p-4 rounded-3xl bg-[#111827]/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {
    /* Trending / Recent Tabs */
  }
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 w-full sm:w-auto">
            <button
    onClick={() => setActiveTab("recent")}
    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${activeTab === "recent" ? "bg-purple-900/80 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
  >
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Unlocked</span>
            </button>
            <button
    onClick={() => setActiveTab("trending")}
    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${activeTab === "trending" ? "bg-cyan-900/80 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
  >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending & Popular</span>
            </button>
          </div>

          {
    /* Search */
  }
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
    type="text"
    placeholder="Search public chronicles..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && fetchExplore()}
    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
          </div>
        </div>

        {
    /* Category Pills */
  }
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => <button
    key={cat}
    onClick={() => setCategoryFilter(cat)}
    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${categoryFilter === cat ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-sm" : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}`}
  >
              {cat === "all" ? "All Categories" : cat}
            </button>)}
        </div>
      </div>

      {
    /* Public Capsules Grid */
  }
      {loading ? <div className="py-20 text-center text-xs text-slate-400">Discovering public vaults in orbit...</div> : capsules.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((cap) => <div
    key={cap.id}
    className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl overflow-hidden flex flex-col justify-between group"
  >
              {
    /* Cover Art */
  }
              <div className="relative h-48 w-full overflow-hidden">
                <img
    src={cap.cover_image}
    alt={cap.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                  <Unlock className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-slate-200">
                  {cap.category}
                </div>
              </div>

              {
    /* Capsule Content */
  }
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white line-clamp-1">{cap.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cap.description || "A timeless memory."}</p>
                </div>

                {
    /* Keeper byline & metadata */
  }
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <img
    src={cap.owner_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
    alt=""
    className="w-6 h-6 rounded-full"
  />
                    <span className="truncate max-w-[110px]">{cap.owner_name}</span>
                  </div>

                  <span className="text-[11px] font-mono text-purple-300">
                    {cap.memory_count ?? 0} memories
                  </span>
                </div>

                {
    /* Engagement Bar & Open Button */
  }
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    {
    /* Like */
  }
                    <button
    onClick={() => handleLike(cap.id)}
    className={`flex items-center space-x-1 hover:text-pink-400 transition-colors ${cap.is_liked ? "text-pink-400" : ""}`}
  >
                      <Heart className={`w-4 h-4 ${cap.is_liked ? "fill-pink-400" : ""}`} />
                      <span>{cap.likes_count ?? 0}</span>
                    </button>

                    {
    /* Bookmark */
  }
                    <button
    onClick={() => handleBookmark(cap.id)}
    className={`hover:text-cyan-400 transition-colors ${cap.is_bookmarked ? "text-cyan-400" : ""}`}
    title="Bookmark capsule"
  >
                      <Bookmark className={`w-4 h-4 ${cap.is_bookmarked ? "fill-cyan-400" : ""}`} />
                    </button>

                    {
    /* Report */
  }
                    <button
    onClick={() => setReportTarget(cap)}
    className="hover:text-amber-400 text-slate-600 transition-colors"
    title="Report content"
  >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
    onClick={() => onOpenCapsule(cap.id)}
    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity flex items-center space-x-1.5 shadow-md"
  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Vault</span>
                  </button>
                </div>
              </div>
            </div>)}
        </div> : <div className="py-20 text-center rounded-3xl bg-[#111827]/40 border border-slate-800 space-y-3">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No public unlocked capsules found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching a different category or wait for newly scheduled capsules to reach arrival.
          </p>
        </div>}

      {
    /* Report Modal */
  }
      {reportTarget && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#111827] border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Report Content</h3>
              <button onClick={() => setReportTarget(null)} className="text-slate-400">✕</button>
            </div>

            {reportSubmitted ? <p className="text-xs text-emerald-400 py-4 text-center">
                Report submitted for administrative review. Thank you for safeguarding the stasis archives.
              </p> : <form onSubmit={submitReport} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Reporting "{reportTarget.title}". Please specify why this capsule violates community guidelines.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
                  <select
    value={reportReason}
    onChange={(e) => setReportReason(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
  >
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Harassment or Abuse">Harassment or Abuse</option>
                    <option value="Copyright Infringement">Copyright Infringement</option>
                    <option value="Spam / Malicious">Spam / Malicious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Context</label>
                  <textarea
    rows={3}
    value={reportDetails}
    onChange={(e) => setReportDetails(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
    placeholder="Provide details..."
  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
    type="button"
    onClick={() => setReportTarget(null)}
    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
  >
                    Cancel
                  </button>
                  <button
    type="submit"
    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
  >
                    Submit Report
                  </button>
                </div>
              </form>}
          </div>
        </div>}
    </div>;
};
export {
  ExploreView
};
