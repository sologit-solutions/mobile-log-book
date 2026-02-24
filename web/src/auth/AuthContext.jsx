import React, { createContext, useContext, useMemo, useState } from "react";

/* only a mockup authorization for the front-end, localstorage used */

const AuthContext = createContext(null);

const USERS_KEY = "logify:users";
const SESSION_KEY = "logify:session";

/*remove after backend connection */
function loadUsers() {
    try {
        const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || typeof s !== "object") return null;
        if (s.type === "anon") return { type: "anon" };
        if (s.type === "account" && typeof s.email === "string") {
            return { type: "account", email: s.email };
        }
        return null;
    } catch {
        return null;
    }
}

function saveSession(session) {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) { console.warn(e); }
}

function clearSession() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (e) { console.warn(e); }
}

export function AuthProvider({ children }) {

    const [session, setSession] = useState(() => loadSession());
    const [users, setUsers] = useState(() => loadUsers());

    function setUsersAndPersist(nextUsers) {
        setUsers(nextUsers);
        saveUsers(nextUsers);
    }

    const value = useMemo(() => {
        const isAnonymous = session?.type === "anon";
        const isAuthenticated = !!session;

        let user = null;
        if (session?.type === "account") {
            const email = session.email;
            const found = users.find((u) => u.email === email);
            user = {
                email,
                username: found?.username ?? email.split("@")[0],
            };
        }

        return {
            user,
            isAnonymous,
            isAuthenticated,

            async continueAnonymously() {
                const next = { type: "anon" };
                setSession(next);
                saveSession(next);
                return { ok: true };
            },

            logout() {
                setSession(null);
                clearSession();
            },

            login({ email, password }) {
                if (!email || !password) {
                    return { ok: false, message: "Missing email or password" };
                }

                const normalized = email.toLowerCase().trim();
                const found = users.find((u) => u.email === normalized);

                if (found && found.password !== password) {
                    return { ok: false, message: "Wrong password" };
                }

                /* allowing logins even if not found during dev */
                const nextSession = { type: "account", email: normalized };
                setSession(nextSession);
                saveSession(nextSession);
                return { ok: true };
            },

            signup({ email, password }) {
                if (!email || !password) return { ok: false, message: "Missing email or password" };
                if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters" };

                const normalized = email.toLowerCase().trim();
                const exists = users.some((u) => u.email === normalized);
                if (exists) return { ok: false, message: "Account with this email already exists" };

                const username = normalized.split("@")[0];
                const nextUsers = [{ email: normalized, password, username }, ...users];
                setUsersAndPersist(nextUsers);

                const nextSession = { type: "account", email: normalized };
                setSession(nextSession);
                saveSession(nextSession);

                return { ok: true };
            },

            updateProfile({ username }) {
                if (!session || session.type !== "account") {
                    return { ok: false, message: "Not logged in" };
                }

                const nextUsername = String(username || "").trim();
                if (!nextUsername) return { ok: false, message: "Username is required" };

                const currentEmail = session.email;

                /* creates username even without existing during dev */
                const exists = users.some((u) => u.email === currentEmail);

                const nextUsers = exists
                    ? users.map((u) => (u.email === currentEmail ? { ...u, username: nextUsername } : u))
                    : [{ email: currentEmail, password: "", username: nextUsername }, ...users];
                setUsersAndPersist(nextUsers);
                return { ok: true };
            },

            deleteAccount() {
                if (!session || session.type !== "account") {
                    return { ok: false, message: "Not logged in" };
                }

                const currentEmail = session.email;
                const nextUsers = users.filter((u) => u.email !== currentEmail);
                setUsersAndPersist(nextUsers);

                setSession(null);
                clearSession();
                return { ok: true };
            },
        };
    }, [session, users]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
    return ctx;
}