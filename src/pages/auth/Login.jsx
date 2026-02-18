import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ERROR_MESSAGES } from "@/constants";
import {
  canAttemptLogin,
  recordFailedAttempt,
  clearLoginAttempts,
} from "@/utils/loginRateLimit";
import SinarLabLogo from "@/components/ui/SinarLabLogo";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockout, setLockout] = useState(null);

  useEffect(() => {
    const { allowed, remainingMinutes } = canAttemptLogin();
    if (!allowed && remainingMinutes != null) {
      setLockout(remainingMinutes);
    } else {
      setLockout(null);
    }
  }, [error]);

  useEffect(() => {
    if (!lockout) return;
    const t = setInterval(() => {
      const { allowed, remainingMinutes } = canAttemptLogin();
      if (allowed) {
        setLockout(null);
        setError(null);
        return clearInterval(t);
      }
      if (remainingMinutes != null) setLockout(remainingMinutes);
    }, 60_000);
    return () => clearInterval(t);
  }, [lockout]);

  useEffect(() => {
    if (user) navigate("/admin/categories", { replace: true });
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { allowed, remainingMinutes } = canAttemptLogin();
    if (!allowed) {
      setLockout(remainingMinutes ?? 15);
      setError(
        ERROR_MESSAGES.RATE_LIMIT_LOCKOUT.replace("15", String(remainingMinutes ?? 15))
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      clearLoginAttempts();
      navigate("/admin/categories");
    } catch (err) {
      recordFailedAttempt();
      const { allowed: canRetry, remainingMinutes: rm } = canAttemptLogin();
      if (!canRetry && rm != null) {
        setLockout(rm);
        setError(ERROR_MESSAGES.RATE_LIMIT_LOCKOUT.replace("15", String(rm)));
      } else {
        setError(err.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { allowed } = canAttemptLogin();
  const locked = !allowed || lockout != null;
  const disabled = isSubmitting || locked;

  const cardClass =
    "w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-8 md:p-10 transition-transform transform hover:scale-[1.02] animate-fade-in";

  return (
    <div className="min-h-screen bg-[#1b335a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="mb-8 animate-fade-in-slow">
        <SinarLabLogo size="lg" variant="light" />
      </div>

      <div className={cardClass}>
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Yönetici Girişi</h2>
          <p className="text-sm text-gray-500 mt-1">Lütfen bilgilerinizi girin</p>
        </div>

        {(error || (locked && lockout != null)) && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded text-center">
            {locked && lockout != null
              ? ERROR_MESSAGES.RATE_LIMIT_LOCKOUT.replace("15", String(lockout))
              : error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="admin@solution1.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={disabled}
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 flex items-center justify-center gap-2 min-h-[40px]"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Giriş yapılıyor…
              </>
            ) : locked ? (
              "Giriş geçici olarak kilitlendi"
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
