import { useState, useRef } from "react";
import { api } from "../../lib/api.js";
import { soundFx } from "../../lib/soundEffects.js";
import {
  Upload,
  Calendar,
  Lock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Video,
  Music,
  File,
  Shield,
  Eye
} from "lucide-react";
const CATEGORIES = [
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
const THEMES = [
  { id: "cosmic-cyan", name: "Cosmic Cyan", bg: "from-cyan-900/60 to-purple-950/60", border: "border-cyan-400" },
  { id: "neon-purple", name: "Neon Nebula", bg: "from-purple-950/60 to-indigo-950/60", border: "border-purple-400" },
  { id: "aurora-pink", name: "Solar Aurora", bg: "from-pink-950/60 to-purple-950/60", border: "border-pink-400" },
  { id: "starlight-gold", name: "Golden Epoch", bg: "from-amber-950/60 to-slate-900/60", border: "border-amber-400" }
];
const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80"
];
const PROMPTS = [
  "What is happening in your life right now?",
  "What are your biggest dreams?",
  "What do you hope your future self remembers?",
  "What is a belief or truth you hold today that you never want to compromise?"
];
const CapsuleCreationWizard = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSealingAnimation, setIsSealingAnimation] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [theme, setTheme] = useState("cosmic-cyan");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [letterTitle, setLetterTitle] = useState("Letter to My Future Self");
  const [letterContent, setLetterContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);
  const [datePreset, setDatePreset] = useState("1_year");
  const [customDateTime, setCustomDateTime] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [confirmed, setConfirmed] = useState(false);
  const calculateUnlockDate = () => {
    const now = /* @__PURE__ */ new Date();
    if (datePreset === "1_min") {
      return new Date(now.getTime() + 60 * 1e3).toISOString();
    }
    if (datePreset === "1_day") {
      return new Date(now.getTime() + 864e5).toISOString();
    }
    if (datePreset === "1_month") {
      return new Date(now.getTime() + 30 * 864e5).toISOString();
    }
    if (datePreset === "6_months") {
      return new Date(now.getTime() + 182 * 864e5).toISOString();
    }
    if (datePreset === "1_year") {
      return new Date(now.getTime() + 365 * 864e5).toISOString();
    }
    if (datePreset === "5_years") {
      return new Date(now.getTime() + 5 * 365 * 864e5).toISOString();
    }
    if (datePreset === "10_years") {
      return new Date(now.getTime() + 10 * 365 * 864e5).toISOString();
    }
    if (datePreset === "custom" && customDateTime) {
      return new Date(customDateTime).toISOString();
    }
    return new Date(now.getTime() + 365 * 864e5).toISOString();
  };
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 50MB.`);
        return;
      }
      let type = "other";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";
      else if (file.type.includes("pdf") || file.type.includes("text")) type = "document";
      const previewUrl = URL.createObjectURL(file);
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          file,
          previewUrl,
          name: file.name,
          type,
          size: file.size,
          caption: "",
          description: ""
        }
      ]);
    });
  };
  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };
  const handleFinalSeal = async () => {
    if (!title.trim()) {
      setError("Please provide a title for your capsule in Step 1.");
      setCurrentStep(1);
      return;
    }
    const unlockIso = calculateUnlockDate();
    if (new Date(unlockIso).getTime() <= Date.now()) {
      setError("Unlock date must be in the future.");
      setCurrentStep(4);
      return;
    }
    if (!confirmed) {
      setError("Please check the confirmation box to authorize sealing.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setIsSealingAnimation(true);
    soundFx.playSealSound();
    try {
      const capRes = await api.capsules.create({
        title,
        description,
        category,
        cover_image: customCoverUrl.trim() || coverImage,
        theme,
        visibility,
        unlock_at: unlockIso,
        status: "sealed"
      });
      const createdId = capRes.capsule.id;
      for (const item of uploadedFiles) {
        if (item.file) {
          const fd = new FormData();
          fd.append("file", item.file);
          fd.append("caption", item.caption);
          fd.append("description", item.description);
          await api.memories.upload(createdId, fd);
        }
      }
      if (letterContent.trim()) {
        await api.letters.save(createdId, {
          title: letterTitle,
          content: letterContent,
          prompt_used: selectedPrompt
        });
      }
      setTimeout(() => {
        setIsSealingAnimation(false);
        setIsSubmitting(false);
        onSuccess(createdId);
      }, 2200);
    } catch (err) {
      setIsSealingAnimation(false);
      setIsSubmitting(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to seal capsule.");
      }
    }
  };
  return <div className="max-w-4xl mx-auto py-4">
      {
    /* Sealing Modal Overlay if active */
  }
      {isSealingAnimation && <div className="fixed inset-0 z-50 bg-[#080B16]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-spin" style={{ animationDuration: "4s" }} />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-400 border-dashed animate-spin" style={{ animationDirection: "reverse", animationDuration: "6s" }} />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.8)]">
              <Lock className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-white mb-2">Cryptographic Seal Initiated</h2>
          <p className="text-sm text-cyan-300 font-mono tracking-widest uppercase mb-4">Writing immutable stasis block to temporal vault...</p>
          <div className="max-w-md w-full h-2 rounded-full bg-slate-900 border border-purple-500/30 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 animate-pulse w-full" />
          </div>
        </div>}

      {
    /* Stepper Header */
  }
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Capsule Assembly Protocol
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Forge a New Time Capsule
            </h1>
          </div>
          <button
    onClick={onCancel}
    className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800"
  >
            Cancel
          </button>
        </div>

        {
    /* Step Indicator Bar */
  }
        <div className="grid grid-cols-6 gap-2">
          {[
    { num: 1, label: "Details" },
    { num: 2, label: "Memories" },
    { num: 3, label: "Letter" },
    { num: 4, label: "Target Date" },
    { num: 5, label: "Privacy" },
    { num: 6, label: "Seal" }
  ].map((s) => {
    const isCompleted = currentStep > s.num;
    const isCurrent = currentStep === s.num;
    return <div key={s.num} className="space-y-1">
                <div
      className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted ? "bg-emerald-400" : isCurrent ? "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-slate-800"}`}
    />
                <span className={`block text-[10px] text-center font-semibold truncate ${isCurrent ? "text-cyan-300" : isCompleted ? "text-slate-300" : "text-slate-600"}`}>
                  {s.label}
                </span>
              </div>;
  })}
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>}

      {
    /* STEP CONTAINER */
  }
      <div className="rounded-3xl bg-[#111827]/90 border border-purple-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">

        {
    /* STEP 1: BASIC DETAILS */
  }
        {currentStep === 1 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 1: Capsule Identity</h2>
              <p className="text-xs text-slate-400">Give your memory capsule a name, purpose category, and aesthetic cover.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Capsule Title *
                </label>
                <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. My 20s Road Trip Odyssey, Letter to Age 40, Our Wedding Vault"
    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Memory Context
                </label>
                <textarea
    rows={3}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="What feelings, people, or hopes does this capsule embody?"
    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Color Theme Ambiance
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((th) => <button
    key={th.id}
    type="button"
    onClick={() => setTheme(th.id)}
    className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${theme === th.id ? `${th.border} bg-purple-950/50 text-white shadow-md` : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"}`}
  >
                        {th.name}
                      </button>)}
                  </div>
                </div>
              </div>

              {
    /* Cover Image Picker */
  }
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Capsule Cover Image
                </label>
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {PRESET_COVERS.map((imgUrl, i) => <div
    key={i}
    onClick={() => {
      setCoverImage(imgUrl);
      setCustomCoverUrl("");
    }}
    className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${coverImage === imgUrl && !customCoverUrl ? "border-cyan-400 ring-2 ring-cyan-400/30 scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
  >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </div>)}
                </div>

                <input
    type="text"
    value={customCoverUrl}
    onChange={(e) => setCustomCoverUrl(e.target.value)}
    placeholder="Or enter a custom high-res image URL (Unsplash, etc.)"
    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
              </div>
            </div>
          </div>}

        {
    /* STEP 2: ADD MEMORIES */
  }
        {currentStep === 2 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 2: Upload Precious Memories</h2>
              <p className="text-xs text-slate-400">
                Deposit photographs (JPG, PNG, WEBP), videos (MP4, MOV), voice audio (MP3, WAV), or documents (PDF, TXT).
              </p>
            </div>

            {
    /* Drag and Drop Upload Area */
  }
            <div
    onClick={() => fileInputRef.current?.click()}
    className="border-2 border-dashed border-purple-500/40 hover:border-cyan-400/70 bg-purple-950/20 hover:bg-purple-950/30 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3 group"
  >
              <div className="w-14 h-14 rounded-2xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Upload className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Click or drag files here to deposit</h4>
                <p className="text-xs text-slate-400 mt-1">Photos, Videos, Audio recordings, PDFs up to 50MB</p>
              </div>
              <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/*,video/*,audio/*,.pdf,.txt"
    onChange={handleFileChange}
    className="hidden"
  />
            </div>

            {
    /* Uploaded List Preview */
  }
            {uploadedFiles.length > 0 ? <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Queued Vault Assets ({uploadedFiles.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {uploadedFiles.map((item) => <div
    key={item.id}
    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 relative group"
  >
                      {item.type === "image" ? <img src={item.previewUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                          {item.type === "video" ? <Video className="w-6 h-6 text-pink-400" /> : item.type === "audio" ? <Music className="w-6 h-6 text-cyan-400" /> : <File className="w-6 h-6 text-amber-400" />}
                        </div>}

                      <div className="flex-1 min-w-0 pr-6 space-y-1.5">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <span className="inline-block text-[10px] text-slate-400">
                          {(item.size / 1024).toFixed(0)} KB • {item.type}
                        </span>
                        <input
    type="text"
    placeholder="Add caption (e.g. Sunset in Big Sur)"
    value={item.caption}
    onChange={(e) => {
      const val = e.target.value;
      setUploadedFiles(
        (prev) => prev.map((f) => f.id === item.id ? { ...f, caption: val } : f)
      );
    }}
    className="w-full px-2 py-1 rounded-lg bg-black/40 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
                      </div>

                      <button
    onClick={() => handleRemoveFile(item.id)}
    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
    title="Remove memory"
  >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>)}
                </div>
              </div> : <p className="text-xs text-slate-500 text-center py-2">
                No memories deposited yet. You can also add more after creating.
              </p>}
          </div>}

        {
    /* STEP 3: FUTURE LETTER */
  }
        {currentStep === 3 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 3: Letter to Your Future Self</h2>
              <p className="text-xs text-slate-400">
                Write a raw, unfiltered letter. When opened, it will appear front and center in the ceremonial unveiling.
              </p>
            </div>

            {
    /* Prompt Selector */
  }
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Inspirational Temporal Prompts
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROMPTS.map((p, idx) => <button
    key={idx}
    type="button"
    onClick={() => {
      setSelectedPrompt(p);
      if (!letterContent) {
        setLetterContent(`Prompt: ${p}

Dear Future Me,

`);
      }
    }}
    className={`p-2.5 rounded-xl text-left text-xs transition-all border ${selectedPrompt === p ? "border-purple-400 bg-purple-950/50 text-white" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"}`}
  >
                    "{p}"
                  </button>)}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Letter Title
                </label>
                <input
    type="text"
    value={letterTitle}
    onChange={(e) => setLetterTitle(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Letter Body
                </label>
                <textarea
    rows={8}
    value={letterContent}
    onChange={(e) => setLetterContent(e.target.value)}
    placeholder="Dear Future Me,&#10;&#10;As I seal this capsule, here is what my world looks like..."
    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 font-serif leading-relaxed focus:outline-none focus:border-cyan-400"
  />
              </div>
            </div>
          </div>}

        {
    /* STEP 4: UNLOCK DATE */
  }
        {currentStep === 4 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 4: Designate Target Arrival Date</h2>
              <p className="text-xs text-slate-400">
                Choose when this capsule will break stasis. Our server chronometers ensure zero early peeking.
              </p>
            </div>

            {
    /* Presets */
  }
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
    { id: "1_min", label: "1 Minute (Fast Test Demo)", desc: "Instant testing" },
    { id: "1_day", label: "1 Day", desc: "Tomorrow" },
    { id: "1_month", label: "1 Month", desc: "30 Days" },
    { id: "6_months", label: "6 Months", desc: "Half Year" },
    { id: "1_year", label: "1 Year", desc: "Next Year" },
    { id: "5_years", label: "5 Years", desc: "Five-Year Vault" },
    { id: "10_years", label: "10 Years", desc: "Decade Epoch" },
    { id: "custom", label: "Custom Date & Time", desc: "Specific moment" }
  ].map((preset) => <button
    key={preset.id}
    type="button"
    onClick={() => setDatePreset(preset.id)}
    className={`p-3.5 rounded-2xl text-left border transition-all ${datePreset === preset.id ? "border-cyan-400 bg-cyan-950/40 text-white shadow-lg" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"}`}
  >
                  <p className="text-xs font-bold">{preset.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</p>
                </button>)}
            </div>

            {
    /* Custom Date Input if selected */
  }
            {datePreset === "custom" && <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
                <label className="block text-xs font-semibold text-cyan-300">
                  Select Specific Local Date & Time
                </label>
                <input
    type="datetime-local"
    value={customDateTime}
    onChange={(e) => setCustomDateTime(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl bg-black border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
              </div>}

            {
    /* Calculated Target Date Preview */
  }
            <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 flex items-center space-x-3 text-xs">
              <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400">Scheduled Stasis Release: </span>
                <span className="font-mono font-bold text-cyan-400">
                  {new Date(calculateUnlockDate()).toLocaleString()} (Local Time)
                </span>
              </div>
            </div>
          </div>}

        {
    /* STEP 5: PRIVACY SETTINGS */
  }
        {currentStep === 5 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 5: Privacy Protocol</h2>
              <p className="text-xs text-slate-400">Configure who has access to this capsule upon unlock.</p>
            </div>

            <div className="space-y-4">
              {[
    {
      id: "private",
      title: "Private Stasis (Keeper Only)",
      desc: "Only you can view and open the capsule after unlocking. Highest confidentiality.",
      icon: Lock,
      color: "text-purple-400"
    },
    {
      id: "shared",
      title: "Collaborative Circle (Shared)",
      desc: "Invited friends and family can contribute before sealing and access the memories upon unlocking.",
      icon: Shield,
      color: "text-cyan-400"
    },
    {
      id: "public",
      title: "Public Legacy (Explore Feed)",
      desc: "When unlocked, this capsule will be discoverable in the public Explore directory for other travelers.",
      icon: Eye,
      color: "text-pink-400"
    }
  ].map((opt) => <div
    key={opt.id}
    onClick={() => setVisibility(opt.id)}
    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${visibility === opt.id ? "border-purple-400 bg-purple-950/40 text-white shadow-lg" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"}`}
  >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                    <opt.icon className={`w-5 h-5 ${opt.color}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                </div>)}
            </div>
          </div>}

        {
    /* STEP 6: REVIEW AND SEAL */
  }
        {currentStep === 6 && <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 6: Review & Seal Capsule</h2>
              <p className="text-xs text-slate-400">Verify all temporal parameters before initiating stasis lock.</p>
            </div>

            {
    /* Summary Card */
  }
            <div className="p-5 rounded-2xl bg-[#151B2D] border border-purple-500/30 space-y-4">
              <div className="flex items-center space-x-4">
                <img
    src={customCoverUrl || coverImage}
    alt=""
    className="w-20 h-20 rounded-xl object-cover border border-purple-500/40"
  />
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">{title || "Untitled Capsule"}</h3>
                  <p className="text-xs text-slate-400">{description || "No description provided"}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                      {category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {visibility}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Memories Attached:</span>
                  <span className="font-bold text-white">{uploadedFiles.length} files</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Letter Attached:</span>
                  <span className="font-bold text-white">{letterContent ? "Yes, written" : "None"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Unlock Target:</span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {new Date(calculateUnlockDate()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {
    /* Confirmation Checkbox */
  }
            <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 flex items-start space-x-3">
              <input
    type="checkbox"
    id="sealConfirmation"
    checked={confirmed}
    onChange={(e) => setConfirmed(e.target.checked)}
    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
  />
              <label htmlFor="sealConfirmation" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                <strong>I understand that upon sealing</strong>, this capsule will enter immutable cryptographic stasis. 
                Memories and letters will be locked until the scheduled unlock date arrives.
              </label>
            </div>

            <button
    onClick={handleFinalSeal}
    disabled={!confirmed || isSubmitting}
    className="w-full py-4 rounded-2xl font-heading font-extrabold text-base uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all transform hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center space-x-2"
  >
              <Lock className="w-5 h-5 text-cyan-300" />
              <span>{isSubmitting ? "Sealing Capsule..." : "SEAL MY CAPSULE"}</span>
            </button>
          </div>}

        {
    /* Wizard Navigation Footer */
  }
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
          {currentStep > 1 ? <button
    type="button"
    onClick={() => setCurrentStep(currentStep - 1)}
    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center space-x-1"
  >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button> : <div />}

          {currentStep < 6 && <button
    type="button"
    onClick={() => {
      if (currentStep === 1 && !title.trim()) {
        setError("Please provide a title before proceeding.");
        return;
      }
      setError(null);
      setCurrentStep(currentStep + 1);
    }}
    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 flex items-center space-x-1.5 shadow-md"
  >
              <span>Next: Step {currentStep + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>}
        </div>

      </div>
    </div>;
};
export {
  CapsuleCreationWizard
};
