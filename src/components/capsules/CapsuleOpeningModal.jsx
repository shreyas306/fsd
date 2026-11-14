import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { api } from "../../lib/api.js";
import { soundFx } from "../../lib/soundEffects.js";
import {
  X,
  Unlock,
  Lock,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Clock,
  ShieldCheck,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
const CapsuleOpeningModal = ({ capsuleId, onClose }) => {
  const [data, setData] = useState(null);
  const [sealedCapsule, setSealedCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("initiating");
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("memories");
  const [newComment, setNewComment] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0
  });
  const fetchPayload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.capsules.getOpeningExperience(capsuleId);
      if (res.is_sealed || res.capsule.status === "sealed") {
        setSealedCapsule(res.capsule);
        setLoading(false);
        return;
      }
      setData(res);
      setSealedCapsule(null);
      soundFx.playUnlockChime();
      setTimeout(() => setStage("unveiling"), 1200);
      setTimeout(() => {
        setStage("opened");
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8B5CF6", "#22D3EE", "#F0ABFC", "#ffffff"]
        });
      }, 2600);
    } catch (err) {
      if (err.data?.is_sealed && err.data?.capsule) {
        setSealedCapsule(err.data.capsule);
        setError(null);
      } else {
        setError(err.message || "Could not access capsule.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPayload();
    return () => {
      soundFx.toggleAmbientMusic(false);
    };
  }, [capsuleId]);
  useEffect(() => {
    if (!sealedCapsule) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, new Date(sealedCapsule.unlock_at).getTime() - Date.now());
      if (diff <= 0) {
        clearInterval(timer);
        fetchPayload();
        return;
      }
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1e3 * 60 * 60) % 24);
      const mins = Math.floor(diff / 1e3 / 60 % 60);
      const secs = Math.floor(diff / 1e3 % 60);
      setTimeLeft({ days, hours, mins, secs });
    }, 1e3);
    return () => clearInterval(timer);
  }, [sealedCapsule]);
  const toggleMusic = () => {
    const nextState = !ambientAudioOn;
    setAmbientAudioOn(nextState);
    soundFx.toggleAmbientMusic(nextState);
  };
  const handleTestFastUnlock = async () => {
    if (!sealedCapsule) return;
    try {
      setLoading(true);
      await api.capsules.forceUnlock(sealedCapsule.id);
      fetchPayload();
    } catch (err) {
      alert(err.message || "Fast-unlock failed");
      setLoading(false);
    }
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !data) return;
    try {
      const res = await api.explore.addComment(data.capsule.id, newComment);
      setData({
        ...data,
        comments: [res.comment, ...data.comments]
      });
      setNewComment("");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };
  if (loading) {
    return <div className="fixed inset-0 z-50 bg-[#080B16] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-heading font-bold text-white">Inspecting Temporal Stasis Field...</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying cryptographic seals and arrival timestamps.</p>
      </div>;
  }
  if (sealedCapsule) {
    const unlockDate = new Date(sealedCapsule.unlock_at);
    return <div className="fixed inset-0 z-50 bg-[#080B16]/95 backdrop-blur-2xl text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
        {
      /* Close Button top-right */
    }
        <button
      onClick={onClose}
      className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
      title="Close chamber"
    >
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-xl w-full rounded-3xl bg-gradient-to-b from-[#151B2D]/90 via-[#0F1424]/95 to-[#0A0D18]/95 border-2 border-purple-500/30 p-6 sm:p-8 shadow-[0_0_60px_rgba(139,92,246,0.3)] text-center relative overflow-hidden space-y-6">
          
          {
      /* Background Atmospheric Glow */
    }
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {
      /* Stasis Holographic Lock Graphic */
    }
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="absolute inset-3 rounded-full border border-purple-500/40 border-dashed animate-spin" style={{ animationDirection: "reverse", animationDuration: "12s" }} />
            <div className="w-20 h-20 rounded-full bg-purple-950/80 border border-purple-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.7)]">
              <Lock className="w-10 h-10 text-cyan-300 animate-pulse" />
            </div>
          </div>

          {
      /* Stasis Banner */
    }
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>CRYPTOGRAPHIC STASIS LOCKED</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {sealedCapsule.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              This capsule is sealed until its scheduled arrival date. In accordance with the <strong>Zero Early-Peek Guarantee</strong>, stored memories and letters cannot be unveiled before the timestamp arrives.
            </p>
          </div>

          {
      /* Live Countdown Box */
    }
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/20 space-y-2">
            <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Stasis Release Countdown</span>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="block text-2xl font-extrabold text-white">{timeLeft.days}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="block text-2xl font-extrabold text-cyan-400">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Hours</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="block text-2xl font-extrabold text-purple-300">{String(timeLeft.mins).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Mins</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="block text-2xl font-extrabold text-pink-400">{String(timeLeft.secs).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Secs</span>
              </div>
            </div>

            <p className="text-[11px] text-cyan-400/90 font-mono pt-1">
              Scheduled Arrival: {unlockDate.toLocaleString()}
            </p>
          </div>

          {
      /* Capsule Metadata Preview */
    }
          <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Category</span>
              <span className="text-white font-semibold">{sealedCapsule.category}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Confidentiality</span>
              <span className="text-white font-semibold capitalize">{sealedCapsule.visibility}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Sealed At</span>
              <span className="text-slate-300">
                {sealedCapsule.sealed_at ? new Date(sealedCapsule.sealed_at).toLocaleDateString() : "Just now"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <span className="text-cyan-400 font-mono font-bold">SEALED (LOCKED)</span>
            </div>
          </div>

          {
      /* Action Buttons */
    }
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
      onClick={onClose}
      className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
    >
              Close Chamber
            </button>

            {
      /* Test Override for Demo / Evaluation */
    }
            <button
      onClick={handleTestFastUnlock}
      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg flex items-center justify-center space-x-1.5 transition-all"
      title="Fast-forward unlock for testing demonstration"
    >
              <Unlock className="w-3.5 h-3.5" />
              <span>⚡ Fast-Unlock for Demo</span>
            </button>
          </div>

        </div>
      </div>;
  }
  if (error || !data) {
    return <div className="fixed inset-0 z-50 bg-[#080B16]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 rounded-3xl bg-[#111827] border border-red-500/40 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Stasis Lock Active</h3>
          <p className="text-xs text-red-300 leading-relaxed">{error || "Unable to open capsule."}</p>
          <button
      onClick={onClose}
      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
    >
            Return to Safety
          </button>
        </div>
      </div>;
  }
  const { capsule, memories, letters, comments } = data;
  const currentMemory = memories[activeMemoryIndex];
  return <div className="fixed inset-0 z-50 bg-[#080B16] text-slate-100 flex flex-col overflow-hidden animate-fade-in">
      {
    /* Cinematic Opening Animation Transition */
  }
      {stage !== "opened" && <div className="absolute inset-0 z-50 bg-[#080B16] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-purple-500 animate-spin" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-[0_0_60px_rgba(34,211,238,0.7)]">
              <Unlock className="w-14 h-14 text-white animate-bounce" />
            </div>
          </div>

          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-2">
            STASIS BREACH CONFIRMED
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {capsule.title}
          </h1>
          <p className="text-xs text-slate-300 max-w-sm">
            Sealed on {capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString() : "Historical Epoch"}.
            Now returned to the light of today.
          </p>
        </div>}

      {
    /* Top Navigation Bar */
  }
      <header className="h-16 px-4 sm:px-6 border-b border-purple-500/20 bg-[#0C1020]/90 backdrop-blur-xl flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30">
            <Unlock className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
              {capsule.title}
            </h2>
            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-mono">
              Unlocked Archive • {memories.length} Memories Preserved
            </p>
          </div>
        </div>

        {
    /* Action Controls */
  }
        <div className="flex items-center space-x-2 sm:space-x-3">
          {
    /* Ambient Music Toggle */
  }
          <button
    onClick={toggleMusic}
    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${ambientAudioOn ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"}`}
    title="Toggle procedural ambient soundtrack"
  >
            {ambientAudioOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{ambientAudioOn ? "Soundscape ON" : "Ambient Music"}</span>
          </button>

          {
    /* Close Experience */
  }
          <button
    onClick={onClose}
    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
    title="Close viewer"
  >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {
    /* Main Experience Body */
  }
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {
    /* Left / Center Media Showcase */
  }
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-[#080B16] via-[#0B0F1E] to-[#080B16] overflow-y-auto">
          
          {
    /* Top Selector Tabs */
  }
          <div className="flex items-center justify-center space-x-3 mb-6">
            <button
    onClick={() => setActiveTab("memories")}
    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${activeTab === "memories" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg" : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}`}
  >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Memories Gallery ({memories.length})</span>
            </button>

            {letters.length > 0 && <button
    onClick={() => setActiveTab("letter")}
    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${activeTab === "letter" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg" : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}`}
  >
                <FileText className="w-3.5 h-3.5" />
                <span>Letter to Future Self</span>
              </button>}

            <button
    onClick={() => setActiveTab("comments")}
    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${activeTab === "comments" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg" : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}`}
  >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments ({comments.length})</span>
            </button>
          </div>

          {
    /* TAB 1: MEMORIES SLIDESHOW & PLAYER */
  }
          {activeTab === "memories" && <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
              {currentMemory ? <div className="w-full space-y-4">
                  {
    /* Media Frame */
  }
                  <div className="relative rounded-3xl overflow-hidden bg-black/60 border border-purple-500/30 shadow-2xl flex items-center justify-center min-h-[350px] max-h-[520px]">
                    {currentMemory.file_type === "image" && <img
    src={currentMemory.storage_path}
    alt={currentMemory.caption || currentMemory.file_name}
    className="max-h-[500px] w-auto max-w-full object-contain rounded-2xl"
  />}

                    {currentMemory.file_type === "video" && <video
    src={currentMemory.storage_path}
    controls
    className="max-h-[500px] w-full object-contain rounded-2xl"
  />}

                    {currentMemory.file_type === "audio" && <div className="p-8 text-center space-y-4 w-full max-w-md">
                        <div className="w-20 h-20 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                          <Music className="w-10 h-10 text-cyan-400 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-white">{currentMemory.file_name}</h4>
                        <audio src={currentMemory.storage_path} controls className="w-full" />
                      </div>}

                    {currentMemory.file_type === "document" && <div className="p-8 text-center space-y-4">
                        <FileText className="w-16 h-16 text-purple-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">{currentMemory.file_name}</h4>
                        <p className="text-xs text-slate-400">Preserved document attachment.</p>
                        <a
    href={currentMemory.storage_path}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 text-xs font-semibold text-white"
  >
                          <Download className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </a>
                      </div>}

                    {
    /* Left/Right Floating Navigation */
  }
                    {memories.length > 1 && <>
                        <button
    onClick={() => setActiveMemoryIndex((activeMemoryIndex - 1 + memories.length) % memories.length)}
    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
  >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
    onClick={() => setActiveMemoryIndex((activeMemoryIndex + 1) % memories.length)}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
  >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>}
                  </div>

                  {
    /* Caption & Metadata */
  }
                  <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{currentMemory.caption || currentMemory.file_name}</h4>
                      {currentMemory.description && <p className="text-xs text-slate-300 italic">{currentMemory.description}</p>}
                      <p className="text-[10px] text-slate-500 font-mono">
                        Uploaded by {currentMemory.uploader_name || "Keeper"} • {new Date(currentMemory.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-purple-400">
                        {activeMemoryIndex + 1} / {memories.length}
                      </span>
                      <a
    href={currentMemory.storage_path}
    download={currentMemory.file_name}
    target="_blank"
    rel="noreferrer"
    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-300 hover:text-white flex items-center space-x-1"
    title="Authorized Download"
  >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>

                  {
    /* Thumbnail Strip */
  }
                  {memories.length > 1 && <div className="flex items-center justify-center space-x-2 overflow-x-auto py-2">
                      {memories.map((m, idx) => <button
    key={m.id}
    onClick={() => setActiveMemoryIndex(idx)}
    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${idx === activeMemoryIndex ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
  >
                          {m.file_type === "image" ? <img src={m.storage_path} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">
                              {m.file_type}
                            </div>}
                        </button>)}
                    </div>}
                </div> : <div className="text-center py-20 text-xs text-slate-400">
                  No multimedia items were deposited in this capsule. Check the letter tab.
                </div>}
            </div>}

          {
    /* TAB 2: FUTURE LETTER UNVEILING */
  }
          {activeTab === "letter" && letters.length > 0 && <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
              <div className="p-8 sm:p-12 rounded-3xl bg-[#111827]/90 border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative">
                {
    /* Decorative stamp */
  }
                <div className="absolute top-6 right-6 px-3 py-1 rounded-full border border-purple-500/40 text-[10px] font-mono uppercase tracking-widest text-purple-300">
                  TEMPORAL SEAL: OPEN
                </div>

                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[11px] text-cyan-400 font-mono">
                      Penned by {letters[0].author_name || "Your Past Self"}
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-white mt-1">
                      {letters[0].title}
                    </h3>
                    {letters[0].prompt_used && <p className="text-xs text-purple-300 italic mt-1">
                        Prompt: "{letters[0].prompt_used}"
                      </p>}
                  </div>

                  {
    /* Letter content in warm readable typography */
  }
                  <div className="text-slate-200 text-sm sm:text-base leading-relaxed font-serif whitespace-pre-wrap pt-2">
                    {letters[0].content}
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-500">
                    <span>Written on {new Date(letters[0].created_at).toLocaleDateString()}</span>
                    <span>Delivered into the Future</span>
                  </div>
                </div>
              </div>
            </div>}

          {
    /* TAB 3: COMMENTS & CELEBRATIONS */
  }
          {activeTab === "comments" && <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
              <div className="p-6 rounded-3xl bg-[#111827]/90 border border-slate-800 space-y-4">
                <h3 className="font-bold text-base text-white">Community Reflections & Greetings</h3>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
    type="text"
    required
    placeholder="Leave a message or celebration for this capsule..."
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
  />
                  <button
    type="submit"
    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
  >
                    Post
                  </button>
                </form>

                <div className="space-y-3 pt-2 max-h-72 overflow-y-auto">
                  {comments.length > 0 ? comments.map((c) => <div key={c.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">{c.username}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{c.content}</p>
                      </div>) : <p className="text-xs text-slate-500 text-center py-4">No comments yet. Be the first to reflect!</p>}
                </div>
              </div>
            </div>}

        </div>
      </div>
    </div>;
};
export {
  CapsuleOpeningModal
};
