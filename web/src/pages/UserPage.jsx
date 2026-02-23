import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/userPage.css";

function AvatarIcon() {
    return (
        <i className="gg-smile up-avatarIcon" aria-hidden="true"/>
    );
}

export default function UserPage() {
    const navigate = useNavigate();
    const { user, isAnonymous, updateProfile, deleteAccount } = useAuth();
    const email = user?.email ?? "";
    const username = isAnonymous
        ? "Anonymous"
        : (user?.username ?? (email ? email.split("@")[0] : "Sailor"));
    const memberSince = "10.03.2025"; // demo
    const USERNAME_MAX = 20;
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [draftUsername, setDraftUsername] = useState(username);
    const [manageError, setManageError] = useState("");

    function openManage() {
        setManageError("");
        setDraftUsername(username);
        setIsManageOpen(true);
    }

    function saveManage(e) {
        e.preventDefault();
        setManageError("");
        if (!draftUsername.trim()) {
            setManageError("Username cannot be empty");
            return;
        }

        if (draftUsername.length > USERNAME_MAX) {
            setManageError(`Username must be under ${USERNAME_MAX} characters`);
            return;
        }

        const res = updateProfile({ username: draftUsername.trim() });
        if (!res?.ok) {
            setManageError(res?.message || "Could not save");
            return;
        }
        setIsManageOpen(false);
    }

    function onDeleteAccount() {
        const ok = window.confirm("Are you sure? This will delete your account and cannot be undone");
        if (!ok) return;
        const res = deleteAccount();
        if (res?.ok) navigate("/login", { replace: true });
    }

    return (
        <main className="content up-wrap">
            <section className="up-hero">
                <div className="up-avatar">
                    <AvatarIcon />
                </div>
                <h1 className="up-name">{username}</h1>
                {!isAnonymous && (
                    <button className="up-manageBtn" type="button" onClick={openManage}>
                        Manage account
                    </button>
                )}
            </section>
            <section className="up-section">
                <h2 className="up-sectionTitle">User info</h2>
                <div className="up-infoCard">
                    <div className="up-infoRow">
                        <span className="up-infoLabel">E-mail:</span>
                        <span className="up-infoValue">{isAnonymous ? "anonymous" : email}</span>
                    </div>
                    <div className="up-infoRow">
                        <span className="up-infoLabel">Username:</span>
                        <span className="up-infoValue">{username}</span>
                    </div>
                    <div className="up-infoRow">
                        <span className="up-infoLabel">Member since:</span>
                        <span className="up-infoValue">{isAnonymous ? "—" : memberSince}</span>
                    </div>
                </div>
            </section>
            {/* manage modal */}
            {isManageOpen && !isAnonymous && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsManageOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Manage account</h3>
                        {manageError && <div className="authError">{manageError}</div>}
                        <form className="modalForm" onSubmit={saveManage}>
                            <label className="field">
                                <span className="fieldLabel">E-mail (cannot be changed)</span>
                                <input className="fieldInput" value={email} disabled />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Username</span>
                                <input
                                    className="fieldInput"
                                    value={draftUsername}
                                    maxLength={USERNAME_MAX + 5}
                                    onChange={(e) => setDraftUsername(e.target.value)}
                                    placeholder="Your username"
                                    required
                                />
                                <div
                                    className={`usernameCounter ${
                                        draftUsername.length > USERNAME_MAX ? "over" : ""
                                    }`}
                                >
                                    {draftUsername.length} / {USERNAME_MAX}
                                </div>
                            </label>
                            <div className="modalActions">
                                <button className="btn" type="button" onClick={() => setIsManageOpen(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn"
                                    type="submit"
                                    disabled={!draftUsername.trim() || draftUsername.length > USERNAME_MAX}
                                >
                                    Save
                                </button>
                                <button className="btn btnDelete" type="button" onClick={onDeleteAccount}>
                                    Delete account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}