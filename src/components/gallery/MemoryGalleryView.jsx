import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Star,
  Download,
  Search,
  Filter
} from "lucide-react";
const MemoryGalleryView = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const loadMemories = async () => {
    try {
      setLoading(true);
      const res = await api.memories.gallery({
        type: typeFilter,
        favoriteOnly,
        search: searchQuery
      });
      setMemories(res.memories);
    } catch (err) {
      console.error("Failed to load gallery memories:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadMemories();
  }, [typeFilter, favoriteOnly]);
  const handleToggleFavorite = async (memoryId) => {
    try {
      const res = await api.memories.toggleFavorite(memoryId);
      setMemories((prev) => prev.map((m) => m.id === memoryId ? res.memory : m));
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Chronological Media Hub
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Central Memory Gallery
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore all photographs, voice memos, videos, and documents deposited across your memory vaults.
        </p>
      </div>

      {
    /* Filter and Search Bar */
  }
      <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {
    /* Search */
  }
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
    type="text"
    placeholder="Search captions or filenames..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && loadMemories()}
    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
          </div>

          {
    /* Favorite Toggle */
  }
          <button
    onClick={() => setFavoriteOnly(!favoriteOnly)}
    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${favoriteOnly ? "bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm" : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"}`}
  >
            <Star className={`w-3.5 h-3.5 ${favoriteOnly ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>Favorites Only</span>
          </button>
        </div>

        {
    /* Media Type Tabs */
  }
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {[
    { id: "all", label: "All Artifacts", icon: Filter },
    { id: "image", label: "Photographs", icon: ImageIcon },
    { id: "video", label: "Videos", icon: Video },
    { id: "audio", label: "Voice & Music", icon: Music },
    { id: "document", label: "Documents", icon: FileText }
  ].map((tab) => <button
    key={tab.id}
    onClick={() => setTypeFilter(tab.id)}
    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${typeFilter === tab.id ? "bg-purple-950/80 text-cyan-300 border border-purple-500/40 shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
  >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>)}
        </div>
      </div>

      {
    /* Gallery Grid */
  }
      {loading ? <div className="py-20 text-center text-xs text-slate-400">Filtering memories in stasis...</div> : memories.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {memories.map((mem) => <div
    key={mem.id}
    className="rounded-2xl overflow-hidden bg-[#111827] border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-lg"
  >
              <div
    onClick={() => setSelectedMemory(mem)}
    className="relative h-40 bg-black/60 cursor-pointer overflow-hidden flex items-center justify-center"
  >
                {mem.file_type === "image" ? <img src={mem.storage_path} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /> : mem.file_type === "video" ? <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-pink-400">
                    <Video className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400">Video Clip</span>
                  </div> : mem.file_type === "audio" ? <div className="w-full h-full bg-cyan-950/30 flex flex-col items-center justify-center text-cyan-400">
                    <Music className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400">Audio Track</span>
                  </div> : <div className="w-full h-full bg-purple-950/30 flex flex-col items-center justify-center text-purple-400">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400">Document</span>
                  </div>}

                {
    /* Favorite Star Overlay */
  }
                <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleToggleFavorite(mem.id);
    }}
    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white"
    title="Toggle favorite"
  >
                  <Star className={`w-3.5 h-3.5 ${mem.is_favorite ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                </button>
              </div>

              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-white truncate">{mem.caption || mem.file_name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{(mem.file_size / 1024).toFixed(0)} KB</span>
                  <span>{new Date(mem.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>)}
        </div> : <div className="py-20 text-center rounded-3xl bg-[#111827]/40 border border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No memories found</h3>
          <p className="text-xs text-slate-400">Upload photographs, audio, or videos into your capsules.</p>
        </div>}

      {
    /* Memory Preview Modal */
  }
      {selectedMemory && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-[#111827] border border-purple-500/30 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white truncate">{selectedMemory.caption || selectedMemory.file_name}</h3>
              <button onClick={() => setSelectedMemory(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 bg-black flex items-center justify-center max-h-[500px]">
              {selectedMemory.file_type === "image" && <img src={selectedMemory.storage_path} alt="" className="max-h-[450px] w-auto max-w-full object-contain" />}
              {selectedMemory.file_type === "video" && <video src={selectedMemory.storage_path} controls className="max-h-[450px] w-full object-contain" />}
              {selectedMemory.file_type === "audio" && <div className="p-8 text-center space-y-4 w-full">
                  <Music className="w-12 h-12 text-cyan-400 mx-auto" />
                  <audio src={selectedMemory.storage_path} controls className="w-full" />
                </div>}
              {selectedMemory.file_type === "document" && <div className="p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-purple-400 mx-auto" />
                  <p className="text-xs text-white">{selectedMemory.file_name}</p>
                </div>}
            </div>

            <div className="px-6 py-4 bg-[#111827] border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Uploaded by {selectedMemory.uploader_name || "Keeper"}
              </div>
              <a
    href={selectedMemory.storage_path}
    download={selectedMemory.file_name}
    target="_blank"
    rel="noreferrer"
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5"
  >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
            </div>
          </div>
        </div>}
    </div>;
};
export {
  MemoryGalleryView
};
