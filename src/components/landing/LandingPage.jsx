import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Hourglass,
  Sparkles,
  Lock,
  Unlock,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  FileText,
  Image as ImageIcon,
  Play,
  ChevronRight,
  Eye
} from "lucide-react";
import { api } from "../../lib/api.js";
const LandingPage = ({ onNavigate, onOpenCapsule }) => {
  const { user, quickLoginAs } = useAuth();
  const [featuredCapsules, setFeaturedCapsules] = useState([]);
  const [activeFaq, setActiveFaq] = useState(0);
  const [heroCountdown, setHeroCountdown] = useState({
    days: 342,
    hours: 14,
    minutes: 28,
    seconds: 45
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    api.explore.list({ filter: "recent" }).then((res) => setFeaturedCapsules(res.capsules.slice(0, 3))).catch(() => {
    });
  }, []);
  const faqs = [
    {
      q: "How does automatic unlocking work on the scheduled date?",
      a: "Our server-side scheduled chronometer continually monitors unlock timestamps in UTC. The second your designated unlock time arrives, your capsule transitions to UNLOCKED, triggering celebratory notifications and decrypting your letters and media files."
    },
    {
      q: "Can anyone see my capsule before it unlocks?",
      a: "Never. While sealed, all letters, photos, and voice notes are securely locked and non-accessible. Only the authorized keeper (and explicitly invited contributors) can see the locked metadata and live countdown."
    },
    {
      q: "What file types can I preserve in my capsule?",
      a: "You can upload high-resolution photos (JPG, PNG, WEBP), cinematic videos (MP4, MOV), personal voice notes & music (MP3, WAV), and written letters or documents (PDF, TXT)."
    },
    {
      q: "Can I invite friends and family to contribute before sealing?",
      a: "Yes! Shared capsules allow you to invite loved ones via private invitation links. Each contributor can add their own photographs, heartfelt notes, and personal letters before the owner initiates the final seal."
    },
    {
      q: "What happens if I want to reschedule the unlock date?",
      a: "As the capsule creator, you maintain executive authority. You can reschedule an unlock date to a later date in the future, generating a permanent timestamped audit log."
    }
  ];
  return <div className="min-h-screen bg-[#080B16] text-slate-100 overflow-hidden">
      {
    /* ---------------- 1. HERO SECTION ---------------- */
  }
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {
    /* Ambient atmospheric gradients */
  }
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-purple-700/20 via-indigo-600/15 to-cyan-400/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {
    /* Left Text Column */
  }
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Capture Today. Preserve Forever. Rediscover Tomorrow.</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
              Your Memories <br />
              <span className="text-gradient-cosmic">Deserve a Future.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Capture your present, preserve your memories, and send a beautiful message to the person you'll become.
              Lock photographs, letters, voice recordings, and videos into an encrypted time vault scheduled to unlock exactly when you choose.
            </p>

            {
    /* CTA Buttons */
  }
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
    onClick={() => {
      if (user) onNavigate("/dashboard/capsules/create");
      else onNavigate("/register");
    }}
    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-all transform hover:scale-[1.03] flex items-center justify-center space-x-2"
  >
                <span>Create Your Time Capsule</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
    onClick={() => onNavigate("/how-it-works")}
    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-base text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-purple-500/40 transition-all flex items-center justify-center space-x-2"
  >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Discover How It Works</span>
              </button>
            </div>

            {
    /* Fast Demo login banner */
  }
            {!user && <div className="pt-2 flex items-center justify-center lg:justify-start space-x-3 text-xs text-slate-400">
                <span>Want to test right now?</span>
                <button
    onClick={() => quickLoginAs("alex@timecapsule.com")}
    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
  >
                  One-Click Demo Login
                </button>
                <span>•</span>
                <button
    onClick={() => quickLoginAs("admin@timecapsule.com")}
    className="text-purple-400 hover:text-purple-300 underline font-medium"
  >
                  Admin Login
                </button>
              </div>}

            {
    /* Stats row */
  }
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold font-heading text-white">100%</p>
                <p className="text-xs text-slate-400">Encrypted in Stasis</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-cyan-400">Zero</p>
                <p className="text-xs text-slate-400">Early Peek Access</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-purple-400">2024-2050+</p>
                <p className="text-xs text-slate-400">Temporal Range</p>
              </div>
            </div>
          </div>

          {
    /* Right Column: Large Animated Glowing Digital Capsule with Floating Memories */
  }
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md">
              {
    /* Outer Glowing Rings */
  }
              <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-orbit-slow" />
              <div className="absolute -inset-4 rounded-full border border-cyan-500/20 border-dashed animate-orbit-slow" style={{ animationDirection: "reverse", animationDuration: "45s" }} />

              {
    /* Main Glowing Digital Capsule Container */
  }
              <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#151B2D]/90 via-[#0E1322]/90 to-[#0A0D18]/95 border border-purple-500/40 shadow-[0_0_50px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
                
                {
    /* Capsule Header Status */
  }
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Temporal Stasis: SEALED</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300">
                    ID: CAP-2026-X
                  </span>
                </div>

                {
    /* 3D Holographic Cylinder Capsule Graphic */
  }
                <div className="py-6 flex flex-col items-center justify-center relative">
                  {
    /* Glowing Core */
  }
                  <div className="relative w-36 h-48 rounded-full border-2 border-cyan-400/60 p-2 shadow-[0_0_35px_rgba(34,211,238,0.4)] flex flex-col items-center justify-between bg-gradient-to-b from-purple-900/40 via-indigo-950/60 to-cyan-900/40">
                    
                    {
    /* Top Cap */
  }
                    <div className="w-20 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>

                    {
    /* Capsule Center with Holographic Lock */
  }
                    <div className="flex flex-col items-center space-y-1 my-auto">
                      <div className="w-14 h-14 rounded-full bg-purple-950/80 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                        <Lock className="w-6 h-6 text-cyan-300 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">SEAL ACTIVE</span>
                    </div>

                    {
    /* Bottom Cap */
  }
                    <div className="w-20 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  {
    /* Floating Memory Cards */
  }
                  <div className="absolute -top-2 -left-4 p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-xl backdrop-blur-md transform -rotate-6 animate-float">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-semibold text-slate-200">24 Memories Locked</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-4 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl backdrop-blur-md transform rotate-6 animate-float" style={{ animationDelay: "2s" }}>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold text-slate-200">Letter to Future Self</span>
                    </div>
                  </div>
                </div>

                {
    /* Animated Real-time Countdown Box */
  }
                <div className="mt-2 p-4 rounded-2xl bg-black/40 border border-purple-500/20">
                  <div className="text-[11px] uppercase font-semibold tracking-wider text-slate-400 text-center mb-2.5 flex items-center justify-center space-x-1">
                    <Hourglass className="w-3.5 h-3.5 text-purple-400" />
                    <span>Time Until Destination Arrival</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="block text-xl font-bold text-white">{heroCountdown.days}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Days</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="block text-xl font-bold text-cyan-400">{String(heroCountdown.hours).padStart(2, "0")}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Hours</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="block text-xl font-bold text-purple-300">{String(heroCountdown.minutes).padStart(2, "0")}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Mins</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="block text-xl font-bold text-pink-400">{String(heroCountdown.seconds).padStart(2, "0")}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Secs</span>
                    </div>
                  </div>
                </div>

                {
    /* Capsule Quick Action in Card */
  }
                <div className="mt-4 text-center">
                  <button
    onClick={() => {
      if (featuredCapsules.length > 0) {
        onOpenCapsule(featuredCapsules[0].id);
      } else {
        onNavigate("/explore");
      }
    }}
    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1.5 w-full py-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30 hover:bg-cyan-900/30 transition-all"
  >
                    <Play className="w-3.5 h-3.5 fill-cyan-400" />
                    <span>Experience an Unlocked Capsule Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {
    /* ---------------- 2. HOW IT WORKS ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">Step-by-Step Trajectory</h2>
          <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">How Digital Time Capsule Works</h3>
          <p className="text-sm sm:text-base text-slate-400">
            A frictionless journey to preserve your thoughts, triumphs, and emotions across time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
    {
      step: "01",
      title: "Create Your Vault",
      desc: "Choose a title, cover image, and theme. Dedicate it to travel, love, graduation, or personal growth.",
      icon: Hourglass,
      color: "text-purple-400",
      border: "border-purple-500/30"
    },
    {
      step: "02",
      title: "Add Memories & Letters",
      desc: "Upload high-res photos, videos, voice memos, and compose an honest letter to your future self.",
      icon: FileText,
      color: "text-cyan-400",
      border: "border-cyan-500/30"
    },
    {
      step: "03",
      title: "Set Target Date & Seal",
      desc: "Pick your unlock date (from 1 month to 20 years). Seal your capsule into cryptographic stasis.",
      icon: Lock,
      color: "text-pink-400",
      border: "border-pink-500/30"
    },
    {
      step: "04",
      title: "Rediscover Tomorrow",
      desc: "When the scheduled date arrives, receive alerts and experience a cinematic opening of your past memories.",
      icon: Unlock,
      color: "text-emerald-400",
      border: "border-emerald-500/30"
    }
  ].map((item, idx) => <div
    key={idx}
    className="relative p-6 rounded-2xl bg-[#111827]/70 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1.5 shadow-lg group"
  >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-slate-500">{item.step}</span>
                <div className={`p-2.5 rounded-xl bg-slate-900 border ${item.border}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>)}
        </div>
      </section>

      {
    /* ---------------- 3. CORE FEATURES ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400">Engineered for Permanence</h2>
          <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">Full-Featured Time Preservation</h3>
          <p className="text-sm sm:text-base text-slate-400">
            Every feature is designed to respect the sacred nature of memory and guarantee delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
    {
      icon: Lock,
      title: "Zero Early-Peek Guarantee",
      desc: "Backend-controlled locking prevents bypassing or early reveals. Once sealed, memories stay locked until the timestamp arrives."
    },
    {
      icon: Users,
      title: "Collaborative Time Vaults",
      desc: "Invite friends, family, or colleagues with custom contributor roles. Gather collective memories before sealing."
    },
    {
      icon: Sparkles,
      title: "Cinematic Opening Ceremony",
      desc: "When unlocked, relive your past through an emotional fullscreen experience with ambient soundscapes and slideshows."
    },
    {
      icon: Clock,
      title: "Automated Scheduled Unlocking",
      desc: "Reliable backend cron jobs continuously scan for arrival dates, triggering instant email and in-app alerts."
    },
    {
      icon: Shield,
      title: "Granular Privacy Levels",
      desc: "Keep capsules strictly private, share exclusively with chosen loved ones, or publish to the public explore feed."
    },
    {
      icon: ImageIcon,
      title: "Central Memory Gallery",
      desc: "Organize your photo collections, voice notes, and letters in one beautiful central timeline with instant search."
    }
  ].map((feat, idx) => <div
    key={idx}
    className="p-6 rounded-2xl bg-[#13192B]/80 border border-purple-500/15 hover:border-cyan-500/40 transition-all p-6 space-y-3"
  >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center">
                <feat.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-base font-bold text-white">{feat.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>)}
        </div>
      </section>

      {
    /* ---------------- 4. FEATURED PUBLIC CAPSULES ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">Public Discoveries</h2>
            <h3 className="font-heading text-3xl font-extrabold text-white">Unlocked Chronicles</h3>
            <p className="text-sm text-slate-400">Step inside authentic memories preserved by fellow time explorers.</p>
          </div>
          <button
    onClick={() => onNavigate("/explore")}
    className="mt-4 md:mt-0 text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
  >
            <span>Explore All Public Vaults</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCapsules.length > 0 ? featuredCapsules.map((cap) => <div
    key={cap.id}
    className="rounded-2xl overflow-hidden bg-[#111827] border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-xl flex flex-col"
  >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
    src={cap.cover_image}
    alt={cap.title}
    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                    <Unlock className="w-3 h-3" />
                    <span>UNLOCKED</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/70 text-slate-200">
                    {cap.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-white line-clamp-1">{cap.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cap.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <img
    src={cap.owner_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
    alt=""
    className="w-6 h-6 rounded-full"
  />
                      <span className="truncate max-w-[100px]">{cap.owner_name}</span>
                    </div>

                    <button
    onClick={() => onOpenCapsule(cap.id)}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity flex items-center space-x-1"
  >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Vault</span>
                    </button>
                  </div>
                </div>
              </div>) : <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
              Discovering public vaults in orbit...
            </div>}
        </div>
      </section>

      {
    /* ---------------- 5. TESTIMONIALS ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400">Voices of Keepers</h2>
          <h3 className="font-heading text-3xl font-extrabold text-white">Why People Trust Us With Their Future</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
    {
      quote: "Opening my capsule on my 30th birthday brought me to tears. Reading the letter I wrote at 22 felt like talking directly with my younger self.",
      author: "Dr. Marcus Vance",
      role: "Astrophysics Researcher",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
      quote: "We created a wedding capsule with all our closest friends contributing voice memos and candid snaps. We just unlocked it on our 5th anniversary!",
      author: "Sophia & Liam Keller",
      role: "Designers & Travelers",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
    },
    {
      quote: "The zero early-peek promise is real. There was no temptation to cheat. When the notification arrived, the opening ceremony was magical.",
      author: "David Chen",
      role: "Software Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    }
  ].map((testi, idx) => <div key={idx} className="p-6 rounded-2xl bg-[#111827]/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{testi.quote}"</p>
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/80">
                <img src={testi.avatar} alt={testi.author} className="w-9 h-9 rounded-full object-cover border border-purple-500/30" />
                <div>
                  <h5 className="text-xs font-bold text-white">{testi.author}</h5>
                  <p className="text-[11px] text-slate-400">{testi.role}</p>
                </div>
              </div>
            </div>)}
        </div>
      </section>

      {
    /* ---------------- 6. PRICING PLANS ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">Preservation Tiers</h2>
          <h3 className="font-heading text-3xl font-extrabold text-white">Simple, Perpetual Plans</h3>
          <p className="text-sm text-slate-400">Start preserving for free. Upgrade whenever your memory vaults expand.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[
    {
      title: "Starlight Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for getting started with personal time reflection.",
      features: [
        "Up to 3 Active Sealed Capsules",
        "1 GB Secure Storage",
        "Photos, Audio & Letters",
        "Up to 5 Years Lock Duration",
        "Email Unlock Notification"
      ],
      cta: "Start Free Today",
      popular: false
    },
    {
      title: "Cosmic Voyager",
      price: "$7",
      period: "per month",
      desc: "For individuals and families preserving lifelong memories.",
      features: [
        "Unlimited Sealed Capsules",
        "25 GB Encrypted Media Storage",
        "4K Video & High-Res Audio Memos",
        "Up to 25 Years Lock Duration",
        "Collaborative Family Vaults",
        "Priority Scheduled SMS & Email"
      ],
      cta: "Launch Voyager Vault",
      popular: true
    },
    {
      title: "Infinity Keeper",
      price: "$19",
      period: "one-time / capsule",
      desc: "Permanent generational storage for legacy and wedding vaults.",
      features: [
        "Perpetual Lifetime Capsule",
        "100 GB Dedicated Redundant Vault",
        "Up to 50 Years Lock Guarantee",
        "Unlimited Invited Contributors",
        "Physical High-Gloss Memorial Token",
        "Cinematic Custom Soundtrack"
      ],
      cta: "Seal Eternal Legacy",
      popular: false
    }
  ].map((plan, idx) => <div
    key={idx}
    className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${plan.popular ? "bg-gradient-to-b from-purple-950/60 to-[#111827] border-2 border-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.3)] relative" : "bg-[#111827]/80 border border-slate-800"}`}
  >
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-cyan-400 text-white shadow-md">
                  Most Popular
                </div>}

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xl text-white">{plan.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="font-heading text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  {plan.features.map((feat, fIdx) => <li key={fIdx} className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>)}
                </ul>
              </div>

              <button
    onClick={() => {
      if (user) onNavigate("/dashboard/capsules/create");
      else onNavigate("/register");
    }}
    className={`mt-8 w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${plan.popular ? "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
  >
                {plan.cta}
              </button>
            </div>)}
        </div>
      </section>

      {
    /* ---------------- 7. FAQ ACCORDION ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400">Clarifications</h2>
          <h3 className="font-heading text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
    const isOpen = activeFaq === idx;
    return <div
      key={idx}
      className="rounded-xl bg-[#111827]/80 border border-slate-800 overflow-hidden transition-all"
    >
                <button
      onClick={() => setActiveFaq(isOpen ? null : idx)}
      className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-cyan-300"
    >
                  <span>{faq.q}</span>
                  <ChevronRight
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90 text-cyan-400" : ""}`}
    />
                </button>
                {isOpen && <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>}
              </div>;
  })}
        </div>
      </section>

      {
    /* ---------------- 8. FINAL CALL TO ACTION ---------------- */
  }
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-purple-900/40 via-indigo-950/60 to-cyan-900/40 border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl relative overflow-hidden">
          <div className="space-y-6 max-w-2xl mx-auto relative z-10">
            <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Send a Message into Tomorrow?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Today will soon be a distant memory. Preserve what makes right now unforgettable.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
    onClick={() => {
      if (user) onNavigate("/dashboard/capsules/create");
      else onNavigate("/register");
    }}
    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all transform hover:scale-[1.03]"
  >
                Seal Your First Capsule
              </button>
              <button
    onClick={() => onNavigate("/explore")}
    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700"
  >
                Explore Public Vaults
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export {
  LandingPage
};
