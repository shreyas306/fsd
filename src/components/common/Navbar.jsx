import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Hourglass,
  Sparkles,
  PlusCircle,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Layers,
  ChevronDown,
  Clock
} from "lucide-react";
import { api } from "../../lib/api.js";
const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (user) {
      api.notifications.list().then((res) => setUnreadCount(res.unreadCount)).catch(() => {
      });
    }
  }, [user, currentPath]);
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "FAQ", path: "/faq" }
  ];
  const handleLinkClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };
  return <header className="sticky top-0 z-40 w-full border-b border-purple-500/15 bg-[#080B16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {
    /* Brand Logo */
  }
        <div
    onClick={() => handleLinkClick("/")}
    className="flex items-center space-x-3 cursor-pointer group"
  >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            <div className="w-full h-full bg-[#080B16] rounded-[10px] flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-bold text-lg tracking-wider text-white">TIME CAPSULE</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Digital Memory Vault</p>
          </div>
        </div>

        {
    /* Desktop Navigation Links */
  }
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((item) => {
    const isActive = currentPath === item.path;
    return <button
      key={item.path}
      onClick={() => handleLinkClick(item.path)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-cyan-300 bg-purple-950/40 border border-purple-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]" : "text-slate-300 hover:text-white hover:bg-slate-800/50"}`}
    >
                {item.label}
              </button>;
  })}

          {user && <button
    onClick={() => handleLinkClick("/dashboard")}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${currentPath.startsWith("/dashboard") ? "text-purple-300 bg-purple-950/50 border border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]" : "text-slate-300 hover:text-white hover:bg-slate-800/50"}`}
  >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Dashboard</span>
            </button>}
        </nav>

        {
    /* Right Action Section */
  }
        <div className="hidden md:flex items-center space-x-3">
          {user ? <>
              {
    /* Quick Create Capsule Button */
  }
              <button
    onClick={() => handleLinkClick("/dashboard/capsules/create")}
    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center space-x-1.5 transition-all transform hover:scale-[1.02]"
  >
                <PlusCircle className="w-4 h-4" />
                <span>Create Capsule</span>
              </button>

              {
    /* Notifications */
  }
              <button
    onClick={() => handleLinkClick("/dashboard/notifications")}
    className="relative p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors"
    title="Notifications"
  >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>}
              </button>

              {
    /* User Dropdown */
  }
              <div className="relative">
                <button
    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-purple-500/20 transition-all"
  >
                  <img
    src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
    alt={user.full_name}
    className="w-8 h-8 rounded-full border border-purple-400/50 object-cover"
  />
                  <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111827] border border-purple-500/20 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-purple-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-900/40 text-purple-300 border border-purple-500/30">
                        {user.role}
                      </span>
                    </div>

                    <button
    onClick={() => handleLinkClick("/dashboard/profile")}
    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-purple-950/40 flex items-center space-x-2"
  >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
    onClick={() => handleLinkClick("/dashboard/capsules")}
    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-purple-950/40 flex items-center space-x-2"
  >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>My Capsules</span>
                    </button>

                    {user.role === "admin" && <button
    onClick={() => handleLinkClick("/admin")}
    className="w-full px-4 py-2 text-left text-sm text-cyan-300 hover:text-white hover:bg-cyan-950/30 flex items-center space-x-2"
  >
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Admin Console</span>
                      </button>}

                    <div className="border-t border-slate-800 my-1" />

                    <button
    onClick={() => {
      logout();
      handleLinkClick("/");
    }}
    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center space-x-2"
  >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>}
              </div>
            </> : <div className="flex items-center space-x-2">
              <button
    onClick={() => handleLinkClick("/login")}
    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
  >
                Log In
              </button>
              <button
    onClick={() => handleLinkClick("/register")}
    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all"
  >
                Get Started
              </button>
              {
    /* Quick demo account button */
  }
              <button
    onClick={() => quickLoginAs("alex@timecapsule.com")}
    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-300 border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 transition-colors"
    title="Instant login as demo user"
  >
                Demo Pass
              </button>
            </div>}
        </div>

        {
    /* Mobile menu button */
  }
        <div className="md:hidden flex items-center space-x-2">
          {user && <button
    onClick={() => handleLinkClick("/dashboard/capsules/create")}
    className="p-1.5 rounded-lg bg-purple-600 text-white text-xs"
  >
              <PlusCircle className="w-4 h-4" />
            </button>}
          <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
  >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {
    /* Mobile Drawer */
  }
      {mobileMenuOpen && <div className="md:hidden border-b border-purple-500/20 bg-[#0c1020] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((item) => <button
    key={item.path}
    onClick={() => handleLinkClick(item.path)}
    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-purple-900/30"
  >
              {item.label}
            </button>)}

          {user ? <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2">
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                <div>
                  <div className="text-sm font-semibold text-white">{user.full_name}</div>
                  <div className="text-xs text-purple-400">{user.email}</div>
                </div>
              </div>
              <button
    onClick={() => handleLinkClick("/dashboard")}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-300 hover:bg-purple-900/30"
  >
                Dashboard
              </button>
              <button
    onClick={() => handleLinkClick("/dashboard/capsules")}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-purple-900/30"
  >
                My Capsules
              </button>
              <button
    onClick={() => handleLinkClick("/dashboard/gallery")}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-purple-900/30"
  >
                Memory Gallery
              </button>
              {user.role === "admin" && <button
    onClick={() => handleLinkClick("/admin")}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-cyan-300 hover:bg-cyan-900/30"
  >
                  Admin Console
                </button>}
              <button
    onClick={() => {
      logout();
      handleLinkClick("/");
    }}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30"
  >
                Log Out
              </button>
            </div> : <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
    onClick={() => handleLinkClick("/login")}
    className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white"
  >
                Log In
              </button>
              <button
    onClick={() => handleLinkClick("/register")}
    className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
  >
                Create Account
              </button>
              <button
    onClick={() => {
      quickLoginAs("alex@timecapsule.com");
      setMobileMenuOpen(false);
    }}
    className="w-full text-center px-4 py-2 rounded-lg text-xs font-medium border border-cyan-500/40 text-cyan-300"
  >
                Instant Demo Login
              </button>
            </div>}
        </div>}
    </header>;
};
export {
  Navbar
};
