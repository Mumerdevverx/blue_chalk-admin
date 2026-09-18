import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Image,
  Handshake,
  Trophy,
  Users,
  Phone,
  Newspaper,
  Clapperboard,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { logout } = useAuth();

  const [aboutOpen, setAboutOpen] = useState(false);

  const aboutLinks = [
    {
      name: "About Content",
      path: "/about-content",
      icon: FileText,
    },
    {
      name: "Gallery",
      path: "/gallery",
      icon: Image,
    },
    {
      name: "Clients",
      path: "/clients",
      icon: Handshake,
    },
    {
      name: "Awards",
      path: "/awards",
      icon: Trophy,
    },
    {
      name: "Team",
      path: "/team",
      icon: Users,
    },
  ];

  const contentLinks = [
    {
      name: "Contacts",
      path: "/contacts",
      icon: Phone,
    },
    {
      name: "News",
      path: "/news",
      icon: Newspaper,
    },
    {
      name: "Work",
      path: "/work",
      icon: Clapperboard,
    },
    {
      name: "Footer",
      path: "/footer",
      icon: Settings,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 h-screen shrink-0 bg-gray-900 text-white flex flex-col border-r border-gray-800">

        {/* ================= HEADER ================= */}
        <div className="h-20 shrink-0 px-5 flex items-center border-b border-gray-800">
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <span className="text-gray-900 font-bold text-lg">
                A
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Admin Panel
              </h2>

              <p className="text-xs text-gray-500">
                Content Management
              </p>
            </div>

          </div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 px-3 py-4 overflow-hidden">

          {/* ================= HOME ================= */}
         <Link
  to="/"
  title="Home"
  className={
    "flex items-center justify-start gap-3 w-full px-3 h-10 rounded-lg mb-4 transition-all duration-200 " +
    (isActive("/")
      ? "bg-white/10 text-white"
      : "text-gray-400 hover:bg-white/5 hover:text-white")
  }
>
  <Home size={20} strokeWidth={2} />

  <span className="text-sm font-medium">
    Home
  </span>
</Link>

          {/* ================= ABOUT DROPDOWN ================= */}
          <div className="mb-4">

            <button
              type="button"
              onClick={() => setAboutOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">
                About
              </span>

              <ChevronDown
                size={16}
                strokeWidth={2}
                className={
                  "transition-transform duration-200 " +
                  (aboutOpen ? "rotate-180" : "")
                }
              />
            </button>

            {/* About Links */}
            {aboutOpen && (
              <div className="mt-1 ml-2 space-y-1">

                {aboutLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 " +
                        (active
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white")
                      }
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.2 : 1.8}
                      />

                      <span>{item.name}</span>
                    </Link>
                  );
                })}

              </div>
            )}

          </div>

          {/* ================= CONTENT ================= */}
          <div>

            <div className="px-3 mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Content
              </p>
            </div>

            <div className="space-y-1">

              {contentLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 " +
                      (active
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white")
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.8}
                    />

                    <span>{item.name}</span>
                  </Link>
                );
              })}

            </div>
          </div>

          {/* ================= LOGOUT ================= */}
          <div className="mt-4 pt-3 border-t border-gray-800">

            <button
              type="button"
              onClick={logout}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut
                size={18}
                strokeWidth={1.8}
                className="group-hover:text-red-400 transition-colors"
              />

              <span className="text-sm font-medium">
                Logout
              </span>
            </button>

          </div>

        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
}