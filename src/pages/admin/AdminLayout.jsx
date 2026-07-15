import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";

const API_BASE = "/backend/api";
const LEGACY_ADMIN = "/backend/admin/index.php";

/**
 * Admin sidebar navigation.
 *
 * Migration is happening module-by-module. Items with `to` are already ported to
 * React and render in-app. Items with `legacy: true` still live in the old vanilla
 * PHP admin and link out to it — flip them to a `to` route as each is migrated.
 */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", to: "/admin" },
  { key: "bookings", label: "Bookings", to: "/admin/bookings" },
  { key: "tours", label: "Tours", to: "/admin/tours" },
  { key: "shows", label: "Shows", to: "/admin/shows" },
  { key: "hotels", label: "Hotels", to: "/admin/hotels" },
  { key: "blog", label: "Blog", to: "/admin/blog" },
  { key: "transfers", label: "Transfers", to: "/admin/transfers" },
  { key: "agents", label: "Agents", to: "/admin/agents" },
  { key: "users", label: "Users", to: "/admin/users" },
  { key: "messages", label: "Messages", to: "/admin/messages" },
  { key: "import", label: "Import", to: "/admin/import" },
  { key: "settings", label: "Settings", to: "/admin/settings" },
];

const navClass = ({ isActive }) =>
  `shrink-0 px-4 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-200 ${
    isActive
      ? "bg-yellow text-navy"
      : "text-gray-300 hover:bg-white/10 hover:text-white"
  }`;

/**
 * Chrome + auth gate for the React admin. Every child route renders only after
 * /me confirms an active admin session; otherwise we bounce to /admin/login.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth.php/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!data.success) {
        navigate("/admin/login", { replace: true });
        return null;
      }

      setAdmin(data.data);
      return data.data;
    } catch {
      navigate("/admin/login", { replace: true });
      return null;
    }
  }, [navigate]);

  useEffect(() => {
    loadAdmin().finally(() => setLoading(false));
  }, [loadAdmin]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth.php/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <p className="font-body text-gray-500">Loading admin...</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-light-gray flex flex-col lg:flex-row">
      {/* Sidebar — locked full height on desktop; only the content column scrolls */}
      <aside className="lg:w-56 lg:shrink-0 bg-navy lg:h-screen lg:overflow-y-auto">
        <div className="p-5 lg:p-6">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/Final Logo.png" alt="Logo" className="h-8 shrink-0" />
              <div className="min-w-0">
                <h2 className="font-heading text-xl text-white leading-tight">
                  Admin Panel
                </h2>
                <p className="font-body text-xs text-gray-400 mt-0.5 truncate">
                  {admin.username || admin.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="lg:hidden shrink-0 border border-white/30 text-white px-4 py-2 rounded-xl font-body text-sm font-semibold hover:bg-white hover:text-navy transition-all"
            >
              Log Out
            </button>
          </div>

          <nav className="mt-8 flex lg:flex-col gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) =>
              item.legacy ? (
                <a
                  key={item.key}
                  href={`${LEGACY_ADMIN}#${item.key}`}
                  className="shrink-0 px-4 py-3 rounded-xl font-body font-semibold text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-2"
                >
                  {item.label}
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 border border-gray-600 rounded px-1 py-0.5">
                    old
                  </span>
                </a>
              ) : (
                <NavLink key={item.key} to={item.to} end className={navClass}>
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <button
            onClick={handleLogout}
            className="hidden lg:block w-full mt-8 border-2 border-white/30 text-white px-4 py-3 rounded-xl font-body font-semibold hover:bg-white hover:text-navy transition-all duration-300"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Content — the only scroll container on desktop */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 lg:h-screen lg:overflow-y-auto">
        <Outlet context={{ admin, refreshAdmin: loadAdmin }} />
      </main>
    </div>
    </QueryClientProvider>
  );
}
