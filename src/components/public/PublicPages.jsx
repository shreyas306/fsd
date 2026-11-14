import { useState } from "react";
import {
  Lock,
  Send,
  CheckCircle2,
  Heart,
  Globe
} from "lucide-react";
const AboutPage = ({ onNavigate }) => {
  return <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300">
          Our Temporal Mission
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">Preserving the Human Experience</h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Digital Time Capsule was born from a simple realization: in an era of ephemeral stories and feeds that vanish in 24 hours, our deepest thoughts and life milestones deserve a permanent anchor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="p-6 rounded-2xl bg-[#111827] border border-purple-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Cryptographic Stasis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We enforce immutable, server-authoritative locking so memories cannot be peeked at early, preserving the genuine magic of anticipation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-purple-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-pink-400">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Nostalgic Resonance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Opening a capsule is not just reading a file; it is a cinematic ceremony with ambient music, letters, and media slideshows.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-purple-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Perpetual Delivery</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated scheduled chronometers guarantee your future self receives the notifications whether in 1 year or 25 years.
          </p>
        </div>
      </div>
    </div>;
};
const HowItWorksPage = ({ onNavigate }) => {
  return <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
          The Architecture
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">How Time Travel Works</h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto">
          A transparent look at the mechanics behind our tamper-proof memory vaults.
        </p>
      </div>

      <div className="space-y-6 pt-6">
        {[
    {
      num: "01",
      title: "Vault Initialization & Theme Selection",
      text: "You configure a capsule title, purpose category, custom cover art, and visual ambiance. Choose between private storage or invite collaborative keepers."
    },
    {
      num: "02",
      title: "Memory Ingestion & Letter Composition",
      text: "Upload full-fidelity media: high-resolution imagery, raw audio memos, videos, and PDFs. Write deeply personal letters guided by reflective prompts."
    },
    {
      num: "03",
      title: "Temporal Locking & Stasis Protocol",
      text: "You select the precise future unlock date in your local timezone. The server calculates the exact UTC millisecond, records a cryptographic seal timestamp, and freezes all editing."
    },
    {
      num: "04",
      title: "Scheduled Daemon Cron Verification",
      text: "Our backend cron workers execute continuously. When your unlock timestamp passes, the status changes to UNLOCKED and notifications are dispatched via in-app and Resend email."
    },
    {
      num: "05",
      title: "Cinematic Unveiling Experience",
      text: "When you open your capsule, a fullscreen ceremonial interface unfolds with sound effects, reveal sequence, slideshow, and audio playback."
    }
  ].map((item, i) => <div key={i} className="flex gap-6 p-6 rounded-2xl bg-[#111827] border border-slate-800">
            <span className="font-mono text-xl font-bold text-cyan-400">{item.num}</span>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
            </div>
          </div>)}
      </div>
    </div>;
};
const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", message: "" });
    }, 4e3);
  };
  return <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">Temporal Concierge</h1>
        <p className="text-sm text-slate-400">Have questions about preservation, enterprise vaults, or account inquiries?</p>
      </div>

      <div className="p-8 rounded-3xl bg-[#111827] border border-purple-500/20 shadow-xl">
        {submitted ? <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Transmission Received</h3>
            <p className="text-xs text-slate-300">A temporal archivist will reply to {form.email} within 24 hours.</p>
          </div> : <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Your Name</label>
              <input
    type="text"
    required
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
    placeholder="Alex Vance"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <input
    type="email"
    required
    value={form.email}
    onChange={(e) => setForm({ ...form, email: e.target.value })}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
    placeholder="alex@timecapsule.com"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Message</label>
              <textarea
    rows={4}
    required
    value={form.message}
    onChange={(e) => setForm({ ...form, message: e.target.value })}
    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
    placeholder="How can we assist your preservation journey?"
  />
            </div>
            <button
    type="submit"
    className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white transition-all shadow-lg flex items-center justify-center space-x-2"
  >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>}
      </div>
    </div>;
};
export {
  AboutPage,
  ContactPage,
  HowItWorksPage
};
