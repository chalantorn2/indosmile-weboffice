import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

export default function AgentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/agent_auth.php/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/agent/tours");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden lg:flex items-center overflow-hidden bg-navy">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80"
          alt="Indo Smile Partners"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40"></div>

        <div className="relative z-10 px-16 py-20">
          <h2 className="font-heading text-5xl text-white leading-tight mb-6">
            Your Local Partner in Southern Thailand
          </h2>
          <div className="w-20 h-1 bg-yellow mb-8 rounded-full"></div>
          <ul className="space-y-5">
            {[
              "Exclusive agent contract rates",
              "Live availability and instant confirmation",
              "One dashboard for every booking",
              "24/7 ground operations support",
            ].map((item) => (
              <li key={item} className="flex items-start text-gray-200 font-body text-lg">
                <svg className="w-6 h-6 text-yellow mr-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center bg-light-gray px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <img src="/Final Logo.png" alt="Indo Smile" className="h-16 w-auto mx-auto mb-5" />
              <h1 className="font-heading text-4xl text-navy">Agent Login</h1>
              <p className="font-body text-sm text-gray-500 mt-2">
                Registered partner agents only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block font-body text-sm font-semibold text-navy mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="agency@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-body text-sm font-semibold text-navy mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 font-body text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remember" className="flex items-center gap-2 font-body text-sm text-gray-600">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-yellow"
                  />
                  Remember me
                </label>
                <Link
                  to="/about#contact"
                  className="font-body text-sm text-navy font-semibold hover:text-yellow transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p className="font-body text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-white py-3.5 rounded-xl font-body font-bold hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="font-body text-sm text-gray-500 text-center mt-8">
              Not a partner yet?{" "}
              <button
                onClick={() => navigate("/about#contact")}
                className="text-navy font-semibold underline underline-offset-2 hover:text-yellow transition-colors"
              >
                Apply here
              </button>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/agent"
              className="font-body text-sm text-gray-500 hover:text-navy transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Agent Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
