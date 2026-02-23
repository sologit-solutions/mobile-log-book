import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";
import logo from "../assets/document_logo.png";

export default function LoginPage() {
    const { login, continueAnonymously } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/home";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        setError("");

        const res = login({ email, password });
        if (!res.ok) {
            setError(res.message || "Login failed");
            return;
        }
        navigate(from, { replace: true });
    }

    async function onAnonymous() {
        setError("");
        const res = await continueAnonymously();
        if (res?.ok === false) {
            setError(res.message || "Could not continue anonymously");
            return;
        }
        navigate("/home", { replace: true });
    }

    return (
        <div className="authPage">
            <div className="authCard">
                {/* logo + name*/}
                <div className="authBrand">
                    <img
                        src={logo}
                        alt="Logify logo"
                        className="authLogo"
                    />
                    <div className="authName">Logify</div>
                </div>

                <div className="authHeader">
                    <div className="authTitle">Log in</div>
                    <div className="authSub">
                        Log in or continue without an account.
                    </div>
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
                            autoComplete="current-password"
                            placeholder="••••••••"
                            required
                        />
                    </label>

                    <button className="loginBtn" type="submit">
                        Log in
                    </button>

                    <button
                        className="anonBtn"
                        type="button"
                        onClick={onAnonymous}
                    >
                        Continue anonymously
                    </button>
                </form>

                <div className="authFooter">
                    No account? <Link to="/signup">Create an account</Link>
                </div>
            </div>
        </div>
    );
}
