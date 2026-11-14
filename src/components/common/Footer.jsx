import { useState } from "react";
import { Hourglass, Sparkles, Send, ShieldCheck } from "lucide-react";
const Footer = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4e3);
      setEmail("");
    }
  };
  return <footer className="border-t border-purple-500/15 bg-[#05070e] relative overflow-hidden">
      {
    /* Subtle cosmic background glow */
  }
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {
    /* Brand info */
  }
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#080B16] rounded-[6px] flex items-center justify-center">
                  <Hourglass className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-heading font-bold text-lg text-white tracking-wide">DIGITAL TIME CAPSULE</span>
            </div>
            <p className="text-xs text-purple-300/80 font-medium tracking-wide">
              "Capture Today. Preserve Forever. Rediscover Tomorrow."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              An encrypted temporal vault engineered to safeguard your photographs, letters, and sacred memories until the future arrives.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 Vault Architecture</span>
              </span>
            </div>
          </div>

          {
    /* Quick Links */
  }
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">Vault Exploration</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate("/")} className="hover:text-cyan-300 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/explore")} className="hover:text-cyan-300 transition-colors">
                  Public Discoveries
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/how-it-works")} className="hover:text-cyan-300 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/pricing")} className="hover:text-cyan-300 transition-colors">
                  Vault Storage Plans
                </button>
              </li>
            </ul>
          </div>

          {
    /* Company & Resources */
  }
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">Chronicle & Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate("/about")} className="hover:text-purple-300 transition-colors">
                  About the Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/faq")} className="hover:text-purple-300 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/contact")} className="hover:text-purple-300 transition-colors">
                  Temporal Concierge (Contact)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("/dashboard")} className="hover:text-purple-300 transition-colors">
                  Keeper Dashboard
                </button>
              </li>
            </ul>
          </div>

          {
    /* Temporal Newsletter */
  }
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">Temporal Broadcast</h4>
            <p className="text-xs text-slate-400">
              Receive notifications on milestone unlocks, cosmic astronomical alerts, and preservation best practices.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="traveler@domain.com"
    required
    className="w-full px-3 py-2 rounded-l-lg bg-slate-900/80 border border-purple-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
  />
                <button
    type="submit"
    className="px-3 py-2 rounded-r-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 transition-all flex items-center justify-center"
  >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && <p className="text-xs text-emerald-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Subscribed to Temporal Broadcast frequency!</span>
                </p>}
            </form>
          </div>
        </div>

        {
    /* Bottom bar */
  }
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {(/* @__PURE__ */ new Date()).getFullYear()} Digital Time Capsule Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-400">Full-Stack PostgreSQL & Supabase Engine</span>
            <span>•</span>
            <span className="text-purple-400">Scheduled Automatic Unlocking Active</span>
          </div>
        </div>
      </div>
    </footer>;
};
export {
  Footer
};
