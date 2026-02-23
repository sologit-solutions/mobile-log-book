import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "../assets/document_logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLogs } from "../contexts/LogsContext";
import { useNotes } from "../contexts/NotesContext";
import LogCard from "../components/LogCard";
import NoteCard from "../components/NotesCard";
import { parseDDMMYYYY, daysBetween, parseDateToMs } from "../utils/dates";
import { normalizeTags } from "../utils/tags";

export default function MainPage() {
    const { isAnonymous } = useAuth();
    const { logs: allLogs, deleteLog } = useLogs();
    const { notes: allNotes, updateNote, deleteNote } = useNotes();
    /* stamp time */
    const [nowMs, setNowMs] = useState(() => Date.now());
    useEffect(() => setNowMs(Date.now()), []);
    /* log delete confirm */
    const [deleteLogTarget, setDeleteLogTarget] = useState(null);
    /* delete and edit notes */
    const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
    const [editNoteTarget, setEditNoteTarget] = useState(null);
    const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
    const [noteDraft, setNoteDraft] = useState({ title: "", text: "", tagsText: "" });

    function openEditNote(note) {
        setEditNoteTarget(note);
        setNoteDraft({
            title: note?.title ?? "",
            text: note?.text ?? "",
            tagsText: (note?.tags || []).join(", "),
        });
        setIsEditNoteOpen(true);
    }

    function submitEditNote(e) {
        e.preventDefault();
        if (!editNoteTarget) return;
        const title = noteDraft.title.trim();
        const text = noteDraft.text.trim();
        if (!title || !text) return;
        const tagsArr = normalizeTags(noteDraft.tagsText);
        updateNote(editNoteTarget.id, { title, text, tags: tagsArr });
        setIsEditNoteOpen(false);
        setEditNoteTarget(null);
    }

    function confirmDeleteNote() {
        if (!deleteNoteTarget) return;
        deleteNote(deleteNoteTarget.id);
        setDeleteNoteTarget(null);
    }

    /* logs expanded/scrolled */
    const [expandedId, setExpandedId] = useState(null);
    const outerScrollRef = useRef(null);
    const logRefs = useRef({});

    useEffect(() => {
        if (!expandedId) return;
        const scrollEl = outerScrollRef.current?.getScrollElement?.();
        const cardEl = logRefs.current[expandedId];
        if (!scrollEl || !cardEl) return;
        requestAnimationFrame(() => {
            const top = Math.max(0, cardEl.offsetTop - 12);
            scrollEl.scrollTo({ top, behavior: "smooth" });
        });
    }, [expandedId]);

    function toggleLog(id) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    /* notes expanded */
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    function toggleNote(id) {
        setExpandedNoteId((prev) => (prev === id ? null : id));
    }

    /* last sail stat */
    const lastSailMs = useMemo(() => {
        const best = [...allLogs].sort((a, b) => parseDDMMYYYY(b.date) - parseDDMMYYYY(a.date))[0];
        return best?.date ? parseDateToMs(best.date) : null;
    }, [allLogs]);
    const daysSinceLastSail = lastSailMs ? daysBetween(nowMs, lastSailMs) : null;

    /* last modified */
    const lastModifiedLog = useMemo(() => {
        return [...allLogs].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? null;
    }, [allLogs]);

    const recentLogs = useMemo(() => {
        const sorted = [...allLogs].sort((a, b) => {
            const aKey = a.updatedAt ?? a.createdAt ?? parseDDMMYYYY(a.date);
            const bKey = b.updatedAt ?? b.createdAt ?? parseDDMMYYYY(b.date);
            return bKey - aKey;
        });
        return sorted.slice(0, 5);
    }, [allLogs]);

    const recentNotes = useMemo(() => {
        const sorted = [...allNotes].sort((a, b) => {
            const aKey = a.updatedAt ?? a.createdAt ?? 0;
            const bKey = b.updatedAt ?? b.createdAt ?? 0;
            return bKey - aKey;
        });
        return sorted.slice(0, 5);
    }, [allNotes]);

    function confirmDeleteLog() {
        if (!deleteLogTarget) return;
        deleteLog(deleteLogTarget.id);
        if (expandedId === deleteLogTarget.id) setExpandedId(null);
        setDeleteLogTarget(null);
    }

    return (
        <main className={`content dashboard ${expandedId ? "focusLog" : ""}`}>
            <section className="heroArea">
                <section className="brand">
                    <img src={logo} alt="Logify logo" className="logoImage" />
                    <h1 className="brandTitle">Logify</h1>
                    {isAnonymous ? (
                        <section className="statsRow" aria-label="What you can do">
                            <div className="statCard glowOnHover">
                                <span className="statIcon" aria-hidden="true">
                                    <i className="gg-anchor" />
                                </span>
                                <div className="statText">
                                    <div className="statLabel">Keep up with your days at sea</div>
                                    <div className="statValue">Beat your previous streaks!</div>
                                </div>
                            </div>
                            <div className="statCard glowOnHover">
                                <span className="statIcon" aria-hidden="true">
                                    <i className="gg-pin" />
                                </span>
                                <div className="statText">
                                    <div className="statLabel">Record your journeys</div>
                                    <div className="statValue">Logs and Notes help you stay on track</div>
                                </div>
                            </div>
                            <div className="statCard glowOnHover">
                                <span className="statIcon" aria-hidden="true">
                                    <i className="gg-readme" />
                                </span>
                                <div className="statText">
                                    <div className="statLabel">See useful stats</div>
                                    <div className="statValue">Weather and coordinates in one place</div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="statsRow" aria-label="Stats">
                            <div className="statCard glowOnHover">
                                <span className="statIcon" aria-hidden="true">
                                    <i className="gg-anchor" />
                                </span>
                                <div className="statText">
                                    <div className="statLabel">Days since last sail</div>
                                    <div className="statValue">{daysSinceLastSail ?? "—"}</div>
                                </div>
                            </div>
                            <div className="statCard glowOnHover">
                                <span className="statIcon" aria-hidden="true">
                                    <i className="gg-readme" />
                                </span>
                                <div className="statText">
                                    <div className="statLabel">Total logs</div>
                                    <div className="statValue">{allLogs.length}</div>
                                </div>
                            </div>
                            {lastModifiedLog ? (
                                <Link
                                    to={`/logs?open=${encodeURIComponent(lastModifiedLog.id)}`}
                                    className="statCard glowOnHover statCard--link"
                                >
                                    <span className="statIcon" aria-hidden="true">
                                        <i className="gg-time" />
                                    </span>
                                    <div className="statText">
                                        <div className="statLabel">Last modified</div>
                                        <div className="statValue">{lastModifiedLog.title}</div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="statCard glowOnHover">
                                    <span className="statIcon" aria-hidden="true">
                                        <i className="gg-time" />
                                    </span>
                                    <div className="statText">
                                        <div className="statLabel">Last modified</div>
                                        <div className="statValue">—</div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </section>
            </section>
            {isAnonymous ? (
                <section className="section">
                    <h2 className="sectionTitle">Start logging</h2>
                    <div className="dateInnerList">
                        <article className="logCard open" style={{ cursor: "default" }}>
                            <div className="logSummary">
                                <div className="logSummaryMain">
                                    <div className="logSummaryTop">
                                        <span className="compactTitle">Your first log</span>
                                    </div>
                                    <div className="logMetaRow show">
                                        <span className="metaItem">
                                            <span className="metaIcon" aria-hidden="true">
                                                <i className="gg-sun" />
                                            </span>
                                            <span className="metaText">Sunny, 18°C</span>
                                        </span>
                                        <span className="metaItem">
                                            <span className="metaIcon" aria-hidden="true">
                                                <i className="gg-pin" />
                                            </span>
                                            <span className="metaText">60.17, 24.94</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="logActions" aria-hidden="true" />
                            </div>
                            <div className="logDetails open">
                                <div className="logDetailsInner">
                                    <div className="logDetailsGrid">
                                        <div className="mapThumb mapThumbExpanded" aria-hidden="true" />
                                        <pre className="logText">
                                            Welcome!
                                            This is an example of how an expanded log looks like.
                                            You can see your coordinates, weather information, personal notes and a lot more...
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </article>
                        <article className="logCard closed" style={{ cursor: "default" }}>
                            <div className="logSummary">
                                <div className="mapThumb small" aria-hidden="true">
                                    <div className="mapDot" />
                                </div>
                                <div className="logSummaryMain">
                                    <div className="logSummaryTop">
                                        <span className="compactTitle">Sail smarter - log easier!</span>
                                    </div>
                                    <div className="logPreview">
                                        Logify. Your sailing companion.
                                    </div>
                                </div>
                                <div className="logActions" aria-hidden="true" />
                            </div>
                        </article>
                    </div>
                </section>
            ) : (
                <>
                    {/* recent logs */}
                    <section className="section">
                        <h2 className="sectionTitle">Recent logs</h2>
                        <div className="dashScroll" ref={outerScrollRef}>
                            <div className="dateInnerList">
                                {recentLogs.map((l) => (
                                    <LogCard
                                        key={l.id}
                                        log={l}
                                        isOpen={expandedId === l.id}
                                        onToggle={() => toggleLog(l.id)}
                                        registerRef={(node) => {
                                            if (node) logRefs.current[l.id] = node;
                                            else delete logRefs.current[l.id];
                                        }}
                                        onDelete={() => setDeleteLogTarget(l)}
                                    />
                                ))}
                                {recentLogs.length === 0 && <div className="emptyState">No logs found.</div>}
                            </div>
                        </div>
                    </section>
                    {/* recent notes */}
                    <section className="section">
                        <h2 className="sectionTitle">Recent notes</h2>
                        <div className="dashScroll">
                            <div className="dateInnerList">
                                {recentNotes.map((n) => (
                                    <NoteCard
                                        key={n.id}
                                        note={n}
                                        nowMs={nowMs}
                                        isOpen={expandedNoteId === n.id}
                                        onToggle={() => toggleNote(n.id)}
                                        onEdit={() => openEditNote(n)}
                                        onDelete={() => setDeleteNoteTarget(n)}
                                    />
                                ))}
                                {recentNotes.length === 0 && <div className="emptyState">No notes yet.</div>}
                            </div>
                        </div>
                    </section>
                </>
            )}
            {/* note modal edit */}
            {isEditNoteOpen && editNoteTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsEditNoteOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Edit note</h3>
                        <form className="modalForm" onSubmit={submitEditNote}>
                            <label className="field">
                                <span className="fieldLabel">Title *</span>
                                <input
                                    className="fieldInput"
                                    value={noteDraft.title}
                                    onChange={(e) => setNoteDraft((p) => ({ ...p, title: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Tags</span>
                                <input
                                    className="fieldInput"
                                    value={noteDraft.tagsText}
                                    onChange={(e) => setNoteDraft((p) => ({ ...p, tagsText: e.target.value }))}
                                    placeholder="e.g. Engine, Maintenance"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Text *</span>
                                <textarea
                                    className="fieldTextarea"
                                    value={noteDraft.text}
                                    onChange={(e) => setNoteDraft((p) => ({ ...p, text: e.target.value }))}
                                    required
                                    rows={7}
                                />
                            </label>
                            <div className="modalActions">
                                <button className="btn" type="button" onClick={() => setIsEditNoteOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn" type="submit">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* log delete confirm */}
            {deleteLogTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setDeleteLogTarget(null)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Delete log?</h3>
                        <p className="modalText">
                            Are you sure you want to delete <strong>{deleteLogTarget.title}</strong>? This cannot be undone.
                        </p>
                        <div className="modalActions">
                            <button className="btn" type="button" onClick={() => setDeleteLogTarget(null)}>
                                Cancel
                            </button>
                            <button className="btn btnDelete" type="button" onClick={confirmDeleteLog}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* note delete confirm */}
            {deleteNoteTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setDeleteNoteTarget(null)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Delete note?</h3>
                        <p className="modalText">
                            Are you sure you want to delete <strong>{deleteNoteTarget.title || "Untitled"}</strong>? This cannot be undone.
                        </p>
                        <div className="modalActions">
                            <button className="btn" type="button" onClick={() => setDeleteNoteTarget(null)}>
                                Cancel
                            </button>
                            <button className="btn btnDelete" type="button" onClick={confirmDeleteNote}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}