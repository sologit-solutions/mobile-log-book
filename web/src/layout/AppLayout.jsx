import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import DarkBackground from "../layout/DarkBackground";
import LightBackground from "../layout/LightBackground";

const TABS = [
    { label: "Front page", path: "/home" },
    { label: "Vessel", path: "/vessel", requiresLogin: true },
    { label: "User page", path: "/user", requiresLogin: true },
    { label: "Notes", path: "/notes", requiresLogin: true },
    { label: "Logs", path: "/logs", requiresLogin: true },
];

export default function AppLayout({ defaultTheme = "dark" }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAnonymous, isAuthenticated, logout } = useAuth();
    const [theme, setTheme] = useState(defaultTheme);

    const username = useMemo(() => {
        if (isAnonymous) return "anonymous";
        if (user?.email) return user.email.split("@")[0];
        return "user";
    }, [user, isAnonymous]);

    /* checks which tab is active from url */
    const activeTabLabel = useMemo(() => {
        const match = TABS.find((t) =>
            t.path === "/" ? location.pathname === "/" : location.pathname.startsWith(t.path)
        );
        return match?.label ?? "Front page";
    }, [location.pathname]);

    /* tab navigation */
    function goTab(tab) {
        /* anonymous users can only access first page */
        if (tab.requiresLogin && isAnonymous) {
            navigate("/login", { state: { from: { pathname: tab.path } } });
            return;
        }

        if (tab.requiresLogin && !isAuthenticated) {
            navigate("/login", { state: { from: { pathname: tab.path } } });
            return;
        }
        navigate(tab.path);
    }

    /* log in and log out redirects */
    function onAuthButton() {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        logout();
        navigate("/login", { replace: true });
    }

    /* when anon clicks log in to start they return to same location when they log in */
    function goLoginFromHere() {
        navigate("/login", { state: { from: { pathname: location.pathname } } });
    }

    return (
        <div className={`page ${theme}`}>
            <DarkBackground />
            <LightBackground />
            <header className="topbar">
                <div className="left">
                    {!isAnonymous && <span className="welcome">Welcome {username}!</span>}
                </div>

                <nav className="tabsBar" aria-label="Primary navigation">
                    {TABS.map((t) => {
                        const isActive = activeTabLabel === t.label;

                        return (
                            <button
                                key={t.label}
                                className="tabItem"
                                onClick={() => goTab(t)}
                                type="button"
                                aria-current={isActive ? "page" : undefined}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="right">
                    {isAnonymous ? (
                        <button className="btn glowOnHover btnPrimary btnLarge" type="button" onClick={goLoginFromHere}>
                            Log in to start
                        </button>
                    ) : (
                        <button className="btn glowOnHover" type="button" onClick={onAuthButton}>
                            {isAuthenticated ? "Log out" : "Log in"}
                        </button>
                    )}

                    <div className="toggle-switch glowOnHover" aria-label="Theme toggle">
                        <label className="switch-label">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={theme === "light"}
                                onChange={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                                aria-label="Toggle light and dark mode"
                            />
                            <span className="slider" />
                        </label>
                    </div>
                </div>
            </header>
            <Outlet />
        </div>
    );
}