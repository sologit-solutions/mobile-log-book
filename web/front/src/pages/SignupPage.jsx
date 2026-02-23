import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        setError("");
        const res = signup({ email, password });
        if (!res.ok) {
            setError(res.message || "Signup failed.");
            return;
        }
        /* auth context auto login */
        navigate("/", { replace: true });
    }

    return (
        <div className="authPage">
            <div className="authCard">
                <div className="authHeader">
                    <div className="authTitle">Create account</div>
                    <div className="authSub">Enter an email and password to create an account</div>
                </div>
                {error && <div className="authError">{error}</div>}
                <form className="authForm" onSubmit={onSubmit}>
                    <label className="field">
                        <span>Email</span>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            placeholder="min 6 characters"
                            required
                        />
                    </label>
                    <button className="loginBtn" type="submit">
                        Create account
                    </button>
                    <div className="authFooter">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}