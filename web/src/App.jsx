import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LogsProvider } from "./contexts/LogsContext";
import { NotesProvider } from "./contexts/NotesContext";
import { VesselProvider } from "./contexts/VesselContext";
import RequireAuth from "./auth/RequireAuth";
import AppLayout from "./layout/AppLayout.jsx";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import UserPage from "./pages/UserPage";
import VesselPage from "./pages/VesselPage";
import NotesPage from "./pages/NotesPage";
import LogsPage from "./pages/LogsPage";

function IndexRedirect() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

function AppProviders({ children }) {
    return (
        <AuthProvider>
            <LogsProvider>
                <NotesProvider>
                    <VesselProvider>{children}</VesselProvider>
                </NotesProvider>
            </LogsProvider>
        </AuthProvider>
    );
}

export default function App() {
    return (
        <AppProviders>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<IndexRedirect />} />
                <Route element={
                    <RequireAuth allowAnonymous={true}>
                        <AppLayout defaultTheme="dark" />
                    </RequireAuth>
                }
                >
                    <Route path="/home" element={<MainPage />} />
                    <Route path="/vessel" element={<VesselPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="/user" element={
                        <RequireAuth allowAnonymous={false}>
                            <UserPage />
                        </RequireAuth>
                    }
                    />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppProviders>
    );
}