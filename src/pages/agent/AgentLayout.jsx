import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

const NAV_ITEMS = [
  { to: "/agent/tours", label: "Tours & Rates" },
  { to: "/agent/profile", label: "My Details" },
  { to: "/agent/password", label: "Password" },
];

/**
 * Chrome for the agent portal. Deliberately not the customer Header/Footer: an agent
 * has no use for the marketing nav, and the portal shows net rates the public pages
 * must never surface.
 *
 * Also the portal's single auth gate — every child route renders only once /me has
 * confirmed an active session, and reads the agent through useOutletContext().
 */
export default function AgentLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAgent = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/agent_auth.php/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!data.success) {
        navigate("/agent/login", { replace: true });
        return null;
      }

      setAgent(data.data);
      return data.data;
    } catch (err) {
      navigate("/agent/login", { replace: true });
      return null;
    }
  }, [navigate]);

  useEffect(() => {
    loadAgent().finally(() => setLoading(false));
  }, [loadAgent]);

  // An admin-issued password is temporary — park the agent on the password page
  // until they pick their own.
  useEffect(() => {
    if (agent && Number(agent.must_change_password) === 1 && pathname !== "/agent/password") {
      navigate("/agent/password", { replace: true });
    }
  }, [agent, pathname, navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/agent_auth.php/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/agent/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <p className="font-body text-gray-500">Loading your account...</p>
      </div>
    );
  }

  if (!agent) return null;

  const mustChangePassword = Number(agent.must_change_password) === 1;

  return (
    <div className="min-h-screen bg-light-gray flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-72 lg:shrink-0 bg-navy lg:min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between lg:block">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-yellow/20 text-yellow font-body text-xs font-bold mb-3 border border-yellow/30">
                {agent.agent_code}
              </div>
              <h2 className="font-heading text-2xl text-white leading-tight">
                {agent.company_name}
              </h2>
              <p className="font-body text-sm text-gray-400 mt-1 break-all">{agent.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="lg:hidden shrink-0 border border-white/30 text-white px-4 py-2 rounded-xl font-body text-sm font-semibold hover:bg-white hover:text-navy transition-all"
            >
              Log Out
            </button>
          </div>

          <nav className="mt-8 flex lg:flex-col gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 px-4 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-yellow text-navy"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="hidden lg:block w-full mt-8 border-2 border-white/30 text-white px-4 py-3 rounded-xl font-body font-semibold hover:bg-white hover:text-navy transition-all duration-300"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-6 lg:p-10">
        {mustChangePassword && (
          <div className="mb-6 rounded-xl border border-yellow/40 bg-yellow/10 px-5 py-4">
            <p className="font-body text-sm text-navy">
              <span className="font-bold">Set your own password to continue.</span>{" "}
              The password we issued you is temporary.
            </p>
          </div>
        )}

        <Outlet context={{ agent, refreshAgent: loadAgent }} />
      </main>
    </div>
  );
}
