import { useState } from "react";
import SinarikaLogo from "@/components/ui/SinarikaLogo";

const SITE_ACCESS_KEY = "siteAccessUnlocked";
const GATE_USERNAME = "admin";
const GATE_PASSWORD = "admin123";

export const isSiteAccessUnlocked = () => {
  try {
    return sessionStorage.getItem(SITE_ACCESS_KEY) === "1";
  } catch {
    return false;
  }
};

const setSiteAccessUnlocked = () => {
  try {
    sessionStorage.setItem(SITE_ACCESS_KEY, "1");
  } catch {}
};

const SiteAccessGate = ({ children }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(isSiteAccessUnlocked());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (username === GATE_USERNAME && password === GATE_PASSWORD) {
      setSiteAccessUnlocked();
      setUnlocked(true);
    } else {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-[#1b335a] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <SinarikaLogo size="lg" variant="light" />
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-800">Site Erişimi</h2>
          <p className="text-sm text-gray-500 mt-1">Devam etmek için giriş yapın</p>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kullanıcı adı</label>
            <input
              type="text"
              autoComplete="username"
              placeholder="Kullanıcı adı"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Şifre</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Şifre"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Giriş
          </button>
        </form>
      </div>
    </div>
  );
};

export default SiteAccessGate;
