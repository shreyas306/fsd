import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Hourglass, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const AuthPage = ({ mode, onNavigate }) => {
  const { login, register, googleLogin, quickLoginAs, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const [googleClientId, setGoogleClientId] = useState("");

  // Fetch client ID from backend and initialize Google Sign-In
  useEffect(() => {
    fetch("/api/auth/google-config")
      .then((r) => r.json())
      .then(({ clientId }) => {
        if (clientId) {
          setGoogleClientId(clientId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;
    if (typeof window.google === "undefined") return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: googleBtnRef.current.offsetWidth || 380,
    });
  }, [googleClientId, googleBtnRef.current]);

  const handleGoogleCredentialResponse = async (response) => {
    setError(null);
    setGoogleLoading(true);
    try {
      await googleLogin(response.credential);
      onNavigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Fallback: manual Google sign-in trigger when GSI button is not rendered
  const handleGoogleButtonClick = () => {
    setError(null);
    if (googleClientId && typeof window.google !== "undefined") {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError("Google sign-in popup was blocked or dismissed. Please allow popups for this site.");
        }
      });
    } else {
      setError(
        googleClientId
          ? "Google Sign-In library not loaded yet. Please refresh the page."
          : "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID to your .env file."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
        onNavigate("/dashboard");
      } else if (mode === "register") {
        await register({ email, password, username, full_name: fullName });
        onNavigate("/dashboard");
      } else if (mode === "forgot-password") {
        setResetSent(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected temporal disturbance occurred.");
      }
    }
  };

  return <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-[#111827]/90 border border-purple-500/25 p-8 shadow-[0_0_40px_rgba(139,92,246,0.2)] backdrop-blur-xl relative">
        {
    /* Glow */
  }
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[2px] mx-auto shadow-lg">
            <div className="w-full h-full bg-[#080B16] rounded-[14px] flex items-center justify-center">
              <Hourglass className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-white">
            {mode === "login" && "Return to Your Vault"}
            {mode === "register" && "Begin Your Temporal Legacy"}
            {mode === "forgot-password" && "Recover Temporal Access"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "login" && "Enter credentials to open your protected memory archive."}
            {mode === "register" && "Create your account to start preserving letters and memories."}
            {mode === "forgot-password" && "Enter your registered email to receive access instructions."}
          </p>
        </div>

        {error && <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>}

        {resetSent ? <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Instructions Dispatched</h4>
            <p className="text-xs text-slate-300">
              A recovery link has been dispatched to <strong>{email}</strong>. Check your inbox and follow the steps.
            </p>
            <button
    onClick={() => onNavigate("/login")}
    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
  >
              Back to Login
            </button>
          </div> : <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
    type="text"
    required
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="Alex Vance"
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
    type="text"
    required
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="alex_chronicle"
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
                  </div>
                </div>
              </>}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="traveler@timecapsule.com"
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
              </div>
            </div>

            {mode !== "forgot-password" && <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  {mode === "login" && <button
    type="button"
    onClick={() => onNavigate("/forgot-password")}
    className="text-[11px] text-cyan-400 hover:underline"
  >
                      Forgot password?
                    </button>}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
  />
                </div>
              </div>}

            <button
    type="submit"
    disabled={isLoading}
    className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
  >
              <span>{isLoading ? "Processing..." : mode === "login" ? "Open Vault" : mode === "register" ? "Create Vault Account" : "Dispatch Recovery"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>}

        {/* Google OAuth & Demo logins */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">

          {/* Real Google Sign-In button (rendered by GSI when client ID is set) */}
          {googleClientId ? (
            <div className="relative">
              {googleLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 rounded-xl z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                </div>
              )}
              {/* GSI renders its own button here */}
              <div ref={googleBtnRef} className="w-full flex justify-center" />
            </div>
          ) : (
            /* Fallback button when GOOGLE_CLIENT_ID is not configured */
            <button
              onClick={handleGoogleButtonClick}
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* Quick Demo Login selector */}
          <div className="pt-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center mb-2">Instant Demo Passwords</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
    type="button"
    onClick={() => {
      quickLoginAs("alex@timecapsule.com");
      onNavigate("/dashboard");
    }}
    className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 text-center"
  >
                👤 Demo User (Alex)
              </button>
              <button
    type="button"
    onClick={() => {
      quickLoginAs("admin@timecapsule.com");
      onNavigate("/admin");
    }}
    className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-center"
  >
                🛡️ Admin Account
              </button>
            </div>
          </div>
        </div>

        {/* Bottom switch */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "login" ? <p>
              New to Time Capsule?{" "}
              <button onClick={() => onNavigate("/register")} className="text-cyan-400 hover:underline font-semibold">
                Create an account
              </button>
            </p> : <p>
              Already have a vault?{" "}
              <button onClick={() => onNavigate("/login")} className="text-cyan-400 hover:underline font-semibold">
                Sign in
              </button>
            </p>}
        </div>
      </div>
    </div>;
};
export {
  AuthPage
};
