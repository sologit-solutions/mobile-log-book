import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/* some pages require to be logged in in order to be shown for the user */
export default function RequireAuth({ children, allowAnonymous = false }) {
    const { isAnonymous, isAuthenticated } = useAuth();
    const location = useLocation();

    /* redirects the user to login if isn't logged in */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    /* redirects the user to login if the page isn't allowing to be viewed while anon */
    if (!allowAnonymous && isAnonymous) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}