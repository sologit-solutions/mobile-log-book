import React, { useEffect, useMemo, useRef, useState } from "react";
import SimpleBar from "simplebar-react";
import { useNotes } from "../contexts/NotesContext";
import NoteCard from "../components/NotesCard";
import PlusButton from "../components/PlusButton";
import { wordCount } from "../utils/text";
import { normalizeTags, buildTopTags } from "../utils/tags";

export default function NotesPage() {
    const { notes, addNote, updateNote, deleteNote } = useNotes();

    /* word limits for aesthetic reasons */
    const TITLE_MAX_WORDS = 8;
    const BODY_MAX_WORDS = 300;
    /* tags */
    const MAX_TAGS = 20;
    const TOP_TAGS = 5;
    const [showAllTags, setShowAllTags] = useState(false);
    const tags = useMemo(() => ["All", ...buildTopTags(notes, MAX_TAGS)], [notes]);
    const visibleTags = useMemo(() => {
        if (showAllTags) return tags;
        return tags.slice(0, 1 + TOP_TAGS);
    }, [tags, showAllTags]);

    const [nowMs, setNowMs] = useState(() => Date.now());
    useEffect(() => setNowMs(Date.now()), []);
    const [query, setQuery] = useState("");
    const [activeTag, setActiveTag] = useState("All");
    const [expandedId, setExpandedId] = useState(null);
    /*modals*/
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [draft, setDraft] = useState({ title: "", text: "", tagsText: "" });
    const outerScrollRef = useRef(null);
    const noteRefs = useRef({});

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return notes
            .filter((n) => {
                const matchesQuery = !q || (n.title + " " + n.text).toLowerCase().includes(q);
                const matchesTag = activeTag === "All" || (n.tags || []).includes(activeTag);
                return matchesQuery && matchesTag;
            })
            .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0));
        }, [notes, query, activeTag]);

    useEffect(() => {
        if (!expandedId) return;
        const scrollEl = outerScrollRef.current?.getScrollElement?.();
        const cardEl = noteRefs.current[expandedId];
        if (!scrollEl || !cardEl) return;
        requestAnimationFrame(() => {
            const top = Math.max(0, cardEl.offsetTop - 12);
            scrollEl.scrollTo({ top, behavior: "smooth" });
        });
        }, [expandedId]);

    function toggleNote(id) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    function openCreate() {
        setDraft({ title: "", text: "", tagsText: "" });
        setIsCreateOpen(true);
    }

    function submitCreate(e) {
        e.preventDefault();
        const title = draft.title.trim();
        const text = draft.text.trim();
        if (!title || !text) return;
        if (wordCount(title) > TITLE_MAX_WORDS || wordCount(text) > BODY_MAX_WORDS) return;
        const tagsArr = normalizeTags(draft.tagsText);
        const created = addNote({ title, text, tags: tagsArr });
        setIsCreateOpen(false);
        setActiveTag("All");
        setQuery("");
        setExpandedId(created?.id ?? null);
    }

    function openEdit(note) {
        setEditTarget(note);
        setDraft({
            title: note.title ?? "",
            text: note.text ?? "",
            tagsText: (note.tags || []).join(", "),
        });
        setIsEditOpen(true);
    }

    function submitEdit(e) {
        e.preventDefault();
        if (!editTarget) return;
        const title = draft.title.trim();
        const text = draft.text.trim();
        if (!title || !text) return;
        if (wordCount(title) > TITLE_MAX_WORDS || wordCount(text) > BODY_MAX_WORDS) return;
        const tagsArr = normalizeTags(draft.tagsText);
        updateNote(editTarget.id, { title, text, tags: tagsArr });
        setIsEditOpen(false);
        setEditTarget(null);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteNote(deleteTarget.id);
        if (expandedId === deleteTarget.id) setExpandedId(null);
        setDeleteTarget(null);
    }

    const tooLong = wordCount(draft.title) > TITLE_MAX_WORDS || wordCount(draft.text) > BODY_MAX_WORDS;

    return (
        <main className={`content ${expandedId ? "focusLog" : ""}`}>
            <section className="heroArea">
                <section className="brand">
                    <h1 className="brandName" style={{ marginBottom: 10 }}>
                        Notes
                    </h1>
                    {/* search */}
                    <div className="searchContainer">
                        <div className="searchBox">
                            <input
                                className="searchInput"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search notes..."
                                aria-label="Search notes"
                            />
                            <span className="searchIcon inside" aria-hidden="true">
                                <i className="gg-search" />
                            </span>
                        </div>
                    </div>
                    {/* tag chips */}
                    <div className="chipsRow" role="tablist" aria-label="Note tags">
                        {visibleTags.map((t) => {
                            const isActive = activeTag === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    className={`chip glowOnHover ${isActive ? "chip--active" : ""}`}
                                    onClick={() => setActiveTag(t)}
                                    aria-pressed={isActive}
                                >
                                    {t}
                                </button>
                            );
                        })}
                        {tags.length > 1 + TOP_TAGS && (
                            <button
                                type="button"
                                className="chip glowOnHover chip--more"
                                onClick={() => setShowAllTags((p) => !p)}
                            >
                                {showAllTags ? "Less…" : "More…"}
                            </button>
                        )}
                    </div>
                    {/* create */}
                    <PlusButton
                        className="createLogBtn Btn"
                        onClick={openCreate}
                        ariaLabel="Create note"
                        title="Create note"
                    />
                </section>
            </section>
            <section className="section">
                <h2 className="sectionTitle">All notes</h2>
                <SimpleBar className="logsScroll" ref={outerScrollRef}>
                    <div className="dateInnerList">
                        {filtered.map((n) => (
                            <NoteCard
                                key={n.id}
                                note={n}
                                nowMs={nowMs}
                                isOpen={expandedId === n.id}
                                onToggle={() => toggleNote(n.id)}
                                registerRef={(node) => {
                                    if (node) noteRefs.current[n.id] = node;
                                    else delete noteRefs.current[n.id];
                                }}
                                onEdit={() => openEdit(n)}
                                onDelete={() => setDeleteTarget(n)}
                                onTagClick={(t) => {
                                    setActiveTag(t);
                                    setExpandedId(null);
                                    outerScrollRef.current?.getScrollElement?.()?.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        ))}
                        {filtered.length === 0 && <div className="emptyState">No notes found.</div>}
                    </div>
                </SimpleBar>
            </section>
            {/* create modal */}
            {isCreateOpen && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsCreateOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">New note</h3>
                        <form className="modalForm" onSubmit={submitCreate}>
                            <label className="field">
                                <span className="fieldLabel">Title *</span>
                                <input
                                    className="fieldInput"
                                    value={draft.title}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Engine checklist"
                                    required
                                />
                                <div className={`wordCount ${wordCount(draft.title) > TITLE_MAX_WORDS ? "over" : ""}`}>
                                    {wordCount(draft.title)}/{TITLE_MAX_WORDS} words
                                </div>
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Tags</span>
                                <input
                                    className="fieldInput"
                                    value={draft.tagsText}
                                    onChange={(e) => setDraft((p) => ({ ...p, tagsText: e.target.value }))}
                                    placeholder="e.g. Engine, Maintenance"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Text *</span>
                                <textarea
                                    className="fieldTextarea"
                                    value={draft.text}
                                    onChange={(e) => setDraft((p) => ({ ...p, text: e.target.value }))}
                                    placeholder="Write your note..."
                                    required
                                    rows={7}
                                />
                                <div className={`wordCount ${wordCount(draft.text) > BODY_MAX_WORDS ? "over" : ""}`}>
                                    {wordCount(draft.text)}/{BODY_MAX_WORDS} words
                                </div>
                            </label>
                            <div className="modalActions">
                                <button className="btn" type="button" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn" type="submit" disabled={tooLong}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* edit modal */}
            {isEditOpen && editTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsEditOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Edit note</h3>
                        <form className="modalForm" onSubmit={submitEdit}>
                            <label className="field">
                                <span className="fieldLabel">Title *</span>
                                <input
                                    className="fieldInput"
                                    value={draft.title}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                    required
                                />
                                <div className={`wordCount ${wordCount(draft.title) > TITLE_MAX_WORDS ? "over" : ""}`}>
                                    {wordCount(draft.title)}/{TITLE_MAX_WORDS} words
                                </div>
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Tags</span>
                                <input
                                    className="fieldInput"
                                    value={draft.tagsText}
                                    onChange={(e) => setDraft((p) => ({ ...p, tagsText: e.target.value }))}
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Text *</span>
                                <textarea
                                    className="fieldTextarea"
                                    value={draft.text}
                                    onChange={(e) => setDraft((p) => ({ ...p, text: e.target.value }))}
                                    required
                                    rows={7}
                                />
                                <div className={`wordCount ${wordCount(draft.text) > BODY_MAX_WORDS ? "over" : ""}`}>
                                    {wordCount(draft.text)}/{BODY_MAX_WORDS} words
                                </div>
                            </label>
                            <div className="modalActions">
                                <button className="btn" type="button" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn" type="submit" disabled={tooLong}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* confirm delete */}
            {deleteTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setDeleteTarget(null)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Delete note?</h3>
                        <p className="modalText">
                            Are you sure you want to delete <strong>{deleteTarget.title || "Untitled"}</strong>? This cannot be undone.
                        </p>
                        <div className="modalActions">
                            <button className="btn" type="button" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </button>
                            <button className="btn btnDelete" type="button" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}