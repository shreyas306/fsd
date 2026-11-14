import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { LandingPage } from "./components/landing/LandingPage.jsx";
import { AboutPage, HowItWorksPage, ContactPage } from "./components/public/PublicPages.jsx";
import { AuthPage } from "./components/auth/AuthPages.jsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout.jsx";
import { DashboardOverview } from "./components/dashboard/DashboardOverview.jsx";
import { CapsulesListView } from "./components/capsules/CapsulesListView.jsx";
import { CapsuleCreationWizard } from "./components/capsules/CapsuleCreationWizard.jsx";
import { MemoryGalleryView } from "./components/gallery/MemoryGalleryView.jsx";
import { SharedCapsulesView } from "./components/shared/SharedCapsulesView.jsx";
import { ExploreView } from "./components/explore/ExploreView.jsx";
import { NotificationsView } from "./components/notifications/NotificationsView.jsx";
import { ProfileView, SettingsView } from "./components/profile/ProfileAndSettingsViews.jsx";
import { AdminPortalView } from "./components/admin/AdminPortalView.jsx";
import { CapsuleOpeningModal } from "./components/capsules/CapsuleOpeningModal.jsx";
import { InviteContributorModal } from "./components/capsules/InviteContributorModal.jsx";
import { api } from "./lib/api.js";
import { soundFx } from "./lib/soundEffects.js";
import { Unlock, X as CloseIcon, Sparkles as SparklesIcon } from "lucide-react";
function MainRouter() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || "/";
  });
  const [openingCapsuleId, setOpeningCapsuleId] = useState(null);
  const [inviteCapsuleId, setInviteCapsuleId] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const seenNotifIds = useState(() => new Set())[0];

  // Request desktop notification permission on login
  useEffect(() => {
    if (user && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [user]);

  // Poll for real-time seal opening notifications
  useEffect(() => {
    if (!user) return;
    const checkSealNotifications = async () => {
      try {
        const res = await api.notifications.list();
        const unlockedNotifs = (res.notifications || []).filter(
          (n) => n.type === "capsule_unlocked" && !n.is_read
        );
        for (const notif of unlockedNotifs) {
          if (!seenNotifIds.has(notif.id)) {
            seenNotifIds.add(notif.id);
            setActiveToast(notif);
            soundFx.playUnlockChime();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(notif.title || "Time Capsule Seal Opened!", {
                body: notif.message,
                icon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100"
              });
            }
            break;
          }
        }
      } catch (err) {
        // Silent ignore on poll errors
      }
    };
    checkSealNotifications();
    const interval = setInterval(checkSealNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const renderContent = () => {
    if (currentPath === "/") {
      return <LandingPage
        onNavigate={navigate}
        onOpenCapsule={(id) => setOpeningCapsuleId(id)}
      />;
    }
    if (currentPath === "/about") {
      return <AboutPage onNavigate={navigate} />;
    }
    if (currentPath === "/how-it-works") {
      return <HowItWorksPage onNavigate={navigate} />;
    }
    if (currentPath === "/pricing" || currentPath === "/faq") {
      return <LandingPage
        onNavigate={navigate}
        onOpenCapsule={(id) => setOpeningCapsuleId(id)}
      />;
    }
    if (currentPath === "/contact") {
      return <ContactPage onNavigate={navigate} />;
    }
    if (currentPath === "/explore") {
      return <ExploreView onOpenCapsule={(id) => setOpeningCapsuleId(id)} />;
    }
    if (currentPath === "/login") {
      return <AuthPage mode="login" onNavigate={navigate} />;
    }
    if (currentPath === "/register") {
      return <AuthPage mode="register" onNavigate={navigate} />;
    }
    if (currentPath === "/forgot-password") {
      return <AuthPage mode="forgot-password" onNavigate={navigate} />;
    }
    if (currentPath.startsWith("/dashboard") || currentPath.startsWith("/admin")) {
      if (!user && !isLoading) {
        return <AuthPage mode="login" onNavigate={navigate} />;
      }
      return <DashboardLayout currentPath={currentPath} onNavigate={navigate}>
          {currentPath === "/dashboard" && <DashboardOverview
        onNavigate={navigate}
        onOpenCapsule={(id) => setOpeningCapsuleId(id)}
      />}
          {currentPath === "/dashboard/capsules" && <CapsulesListView
        onNavigate={navigate}
        onOpenCapsule={(id) => setOpeningCapsuleId(id)}
        onInviteModal={(id) => setInviteCapsuleId(id)}
      />}
          {currentPath === "/dashboard/capsules/create" && <CapsuleCreationWizard
        onSuccess={(id) => {
          navigate("/dashboard/capsules");
        }}
        onCancel={() => navigate("/dashboard/capsules")}
      />}
          {currentPath === "/dashboard/gallery" && <MemoryGalleryView />}
          {currentPath === "/dashboard/shared" && <SharedCapsulesView
        onNavigate={navigate}
        onOpenCapsule={(id) => setOpeningCapsuleId(id)}
        onOpenInviteModal={(id) => setInviteCapsuleId(id)}
      />}
          {currentPath === "/dashboard/notifications" && <NotificationsView onOpenCapsule={(id) => setOpeningCapsuleId(id)} />}
          {currentPath === "/dashboard/profile" && <ProfileView />}
          {currentPath === "/dashboard/settings" && <SettingsView />}
          {currentPath === "/admin" && <AdminPortalView />}
        </DashboardLayout>;
    }
    return <LandingPage onNavigate={navigate} onOpenCapsule={(id) => setOpeningCapsuleId(id)} />;
  };
  const isDashboardRoute = currentPath.startsWith("/dashboard") || currentPath.startsWith("/admin");
  return <div className="min-h-screen bg-[#080B16] flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {
    /* Top Navbar */
  }
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {
    /* Main Content Area */
  }
      <main className="flex-1">{renderContent()}</main>

      {
    /* Footer on public pages */
  }
      {!isDashboardRoute && <Footer onNavigate={navigate} />}

      {
    /* Cinematic Capsule Opening Modal */
  }
      {openingCapsuleId && <CapsuleOpeningModal
    capsuleId={openingCapsuleId}
    onClose={() => setOpeningCapsuleId(null)}
  />}

      {
    /* Invite Contributor Modal */
  }
      {inviteCapsuleId && <InviteContributorModal
    capsuleId={inviteCapsuleId}
    onClose={() => setInviteCapsuleId(null)}
  />}
      {/* Real-time Seal Opened Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#111827]/95 border border-cyan-400/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.35)] backdrop-blur-2xl animate-fade-in flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex-shrink-0 animate-pulse">
            <Unlock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold">Temporal Alert</span>
              <SparklesIcon className="w-3 h-3 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white truncate">{activeToast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{activeToast.message}</p>
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() => {
                  if (activeToast.capsule_id) {
                    setOpeningCapsuleId(activeToast.capsule_id);
                  }
                  api.notifications.markRead(activeToast.id).catch(() => {});
                  setActiveToast(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity"
              >
                Open Capsule
              </button>
              <button
                onClick={() => {
                  api.notifications.markRead(activeToast.id).catch(() => {});
                  setActiveToast(null);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>;
}
function App() {
  return <AuthProvider>
      <MainRouter />
    </AuthProvider>;
}
export {
  App as default
};
