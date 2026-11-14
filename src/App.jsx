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
function MainRouter() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || "/";
  });
  const [openingCapsuleId, setOpeningCapsuleId] = useState(null);
  const [inviteCapsuleId, setInviteCapsuleId] = useState(null);
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
