import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Layers,
  Hourglass,
  PlusCircle,
  Image as ImageIcon,
  Users,
  Compass,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
const DashboardLayout = ({ currentPath, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const menuItems = [
    { label: "Overview", path: "/dashboard", icon: Layers },
    { label: "My Capsules", path: "/dashboard/capsules", icon: Hourglass },
    { label: "Create Capsule", path: "/dashboard/capsules/create", icon: PlusCircle, highlight: true },
    { label: "Memory Gallery", path: "/dashboard/gallery", icon: ImageIcon },
    { label: "Shared With Me", path: "/dashboard/shared", icon: Users },
    { label: "Explore Public", path: "/explore", icon: Compass },
    { label: "Notifications", path: "/dashboard/notifications", icon: Bell },
    { label: "Profile", path: "/dashboard/profile", icon: User },
    { label: "Settings", path: "/dashboard/settings", icon: Settings }
  ];
  if (user?.role === "admin") {
    menuItems.push({ label: "Admin Portal", path: "/admin", icon: Shield });
  }
  return <div className="min-h-screen bg-[#080B16] flex">
      {
    /* Desktop Collapsible Sidebar */
  }
      <aside
    className={`hidden md:flex flex-col justify-between border-r border-purple-500/15 bg-[#0C1020]/90 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
  >
        <div className="p-4">
          {
    /* Header toggle */
  }
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            {!collapsed && <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
                Temporal Portal
              </span>}
            <button
    onClick={() => setCollapsed(!collapsed)}
    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white mx-auto"
    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
  >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {
    /* Nav List */
  }
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
    const isActive = currentPath === item.path;
    return <button
      key={item.path}
      onClick={() => onNavigate(item.path)}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-gradient-to-r from-purple-900/60 to-indigo-900/40 text-cyan-300 border border-purple-500/40 shadow-md" : item.highlight ? "bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border border-purple-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
      title={item.label}
    >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>;
  })}
          </nav>
        </div>

        {
    /* User Card & Logout at Bottom */
  }
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 mb-3">
            <img
    src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
    alt=""
    className="w-9 h-9 rounded-full object-cover border border-purple-500/40 flex-shrink-0"
  />
            {!collapsed && <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-purple-400 truncate font-mono">{user?.role}</p>
              </div>}
          </div>

          <button
    onClick={() => {
      logout();
      onNavigate("/");
    }}
    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-colors"
  >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {
    /* Main Content Area */
  }
      <div className="flex-1 flex flex-col min-w-0">
        {
    /* Mobile Header Toggle */
  }
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C1020] border-b border-purple-500/15">
          <button
    onClick={() => setMobileDrawerOpen(true)}
    className="p-2 rounded-lg bg-slate-900 text-slate-300 flex items-center space-x-2"
  >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-semibold">Dashboard Menu</span>
          </button>
          <span className="text-xs font-mono text-cyan-400">Vault Connected</span>
        </div>

        {
    /* Mobile Drawer */
  }
        {mobileDrawerOpen && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex">
            <div className="w-64 bg-[#0C1020] h-full p-4 flex flex-col justify-between border-r border-purple-500/20">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="font-heading font-bold text-sm text-white">Dashboard Navigation</span>
                  <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400">✕</button>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => <button
    key={item.path}
    onClick={() => {
      onNavigate(item.path);
      setMobileDrawerOpen(false);
    }}
    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-purple-900/40 text-left"
  >
                      <item.icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </button>)}
                </nav>
              </div>

              <button
    onClick={() => {
      logout();
      setMobileDrawerOpen(false);
      onNavigate("/");
    }}
    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-xl"
  >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>;
};
export {
  DashboardLayout
};
