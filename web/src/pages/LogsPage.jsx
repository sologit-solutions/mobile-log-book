import React, { useEffect, useMemo, useRef, useState } from "react";
import SimpleBar from "simplebar-react";
import { useLogs } from "../contexts/LogsContext";
import LogCard from "../components/LogCard";
import PlusButton from "../components/PlusButton";
import { useSearchParams } from "react-router-dom";
import { parseDDMMYYYY, formatTodayDDMMYYYY } from "../utils/dates";
import { wordCount } from "../utils/text";
import { normalizeTags, buildTopTags } from "../utils/tags";
import { makeId } from "../utils/id";

export default function LogsPage() {
    const { logs: allLogs, addLog, deleteLog } = useLogs();

    /* word limits for aesthetic reasons */
    const TITLE_MAX_WORDS = 8;
    const BODY_MAX_WORDS = 350;

    /* tags */
    const MAX_TAGS = 20;
    const TOP_TAGS = 5;
    const [showAllTags, setShowAllTags] = useState(false);
    const [activeTag, setActiveTag] = useState("All");

    const [query, setQuery] = useState(""); /*search state*/
    const [expandedId, setExpandedId] = useState(null); /*which log is expanded*/
    const [openDate, setOpenDate] = useState(null); /*which date group is expanded*/
    const [searchParams] = useSearchParams(); /*query params*/
    const didAutoOpenRef = useRef(false); /*prevents auto-opening same log*/

    /* auto-opens a log if URL contains open */
    useEffect(() => {
        if (didAutoOpenRef.current) return;
        const openId = searchParams.get("open");
        if (!openId) return;
        const log = allLogs.find((l) => l.id === openId);
        if (!log) return;
        didAutoOpenRef.current = true;
        setOpenDate(log.date);
        setExpandedId(log.id);
    }, [searchParams, allLogs]);

    /* empty draft for creating a new log */
    function emptyDraft() {
        return {
            date: formatTodayDDMMYYYY(),
            title: "",
            weather: "",
            coords: "",
            tagsText: "",
            text: "",
        };
    }

    /* create modal */
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [draft, setDraft] = useState(emptyDraft);
    /* delete confirm */
    const [deleteTarget, setDeleteTarget] = useState(null);
    const outerScrollRef = useRef(null);
    const logRefs = useRef({});
    /* tag list */
    const tags = useMemo(() => ["All", ...buildTopTags(allLogs, MAX_TAGS)], [allLogs]);
    const visibleTags = useMemo(() => {
        if (showAllTags) return tags;
        return tags.slice(0, 1 + TOP_TAGS);
    }, [tags, showAllTags]);
    /* logs filtered by query and active tag */
    const filteredLogs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allLogs.filter((l) => {
            const matchesQuery = !q || (l.title + " " + l.text).toLowerCase().includes(q);
            const matchesTag = activeTag === "All" || (l.tags || []).includes(activeTag);
            return matchesQuery && matchesTag;
        });
    }, [query, allLogs, activeTag]);
    /* logs grouped by date, newest comes always first */
    const grouped = useMemo(() => {
        const map = new Map();
        for (const l of filteredLogs) {
            const key = l.date || "Unknown date";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(l);
        }
        /* logs sorted inside date groups */
        for (const [, arr] of map) {
            arr.sort((a, b) => {
                const timeA = a.updatedAt ?? a.createdAt ?? 0;
                const timeB = b.updatedAt ?? b.createdAt ?? 0;
                return timeB - timeA;
            });
        }
        /* date groups sorted by newest first */
        return Array.from(map.entries()).sort((a, b) => parseDDMMYYYY(b[0]) - parseDDMMYYYY(a[0]));
    }, [filteredLogs]);

    /* scrolls to expanded log smoothly */
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

    function toggleDate(date) {
        setOpenDate((prev) => (prev === date ? null : date));
        setExpandedId(null);
    }

    /* open create modal */
    function openCreate() {
        setDraft(emptyDraft());
        setIsCreateOpen(true);
    }
    /* create new logs */
    function createLog(e) {
        e.preventDefault();
        const title = draft.title.trim();
        const text = draft.text.trim();
        if (!title || !text) return;
        const titleWords = wordCount(title);
        const bodyWords = wordCount(text);
        if (titleWords > TITLE_MAX_WORDS || bodyWords > BODY_MAX_WORDS) return;
        const newLog = {
            id: makeId("log"),
            date: (draft.date || formatTodayDDMMYYYY()).trim(),
            title,
            weather: draft.weather.trim() || "—",
            coords: draft.coords.trim() || "—",
            tags: normalizeTags(draft.tagsText),
            text,
        };
        addLog(newLog);
        setOpenDate(newLog.date);
        setExpandedId(newLog.id);
        setIsCreateOpen(false);
    }
    /* confirm delete */
    function deleteLogConfirmed() {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        deleteLog(id);
        if (expandedId === id) setExpandedId(null);
        setDeleteTarget(null);
    }

    const tooLong = wordCount(draft.title) > TITLE_MAX_WORDS || wordCount(draft.text) > BODY_MAX_WORDS;

    return (
        <main className={`content ${expandedId ? "focusLog" : ""}`}>
            <section className="heroArea">
                <section className="brand">
                    <h1 className="brandName" style={{ marginBottom: 10 }}>
                        Logs
                    </h1>
                    <div className="searchContainer">
                        <div className="searchBox">
                            <input
                                className="searchInput"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search logs..."
                                aria-label="Search logs"
                            />
                            <span className="searchIcon inside" aria-hidden="true">
                                <i className="gg-search" />
                            </span>
                        </div>
                    </div>

                    {/* tag chips */}
                    <div className="chipsRow" role="tablist" aria-label="Log tags">
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
                    <PlusButton
                        className="createLogBtn Btn"
                        onClick={openCreate}
                        ariaLabel="Create new log"
                        title="Create new log"
                    />
                </section>
            </section>
            <section className="section">
                <h2 className="sectionTitle">All logs</h2>
                <SimpleBar className="logsScroll" ref={outerScrollRef}>
                    {grouped.map(([date, items]) => {
                        const isDateOpen = openDate === date;
                        return (
                            <section key={date} className="dateGroup">
                                <button
                                    className={`dateHeader ${isDateOpen ? "open" : ""}`}
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    aria-expanded={isDateOpen}
                                >
                                    <span className="dateHeaderLeft">
                                        <span className="dateHeaderTitle">{date}</span>
                                        <span className="dateHeaderCount">{items.length} logs</span>
                                    </span>
                                    <span className={`dateChevron ${isDateOpen ? "open" : ""}`} aria-hidden="true">
                    <i className="gg-chevron-down" />
                  </span>
                                </button>
                                {isDateOpen && (
                                    <SimpleBar className="dateInnerScroll">
                                        <div className="dateInnerList">
                                            {items.map((l) => (
                                                <LogCard
                                                    key={l.id}
                                                    log={l}
                                                    isOpen={expandedId === l.id}
                                                    onToggle={() => toggleLog(l.id)}
                                                    registerRef={(node) => {
                                                        if (node) logRefs.current[l.id] = node;
                                                        else delete logRefs.current[l.id];
                                                    }}
                                                    onDelete={() => setDeleteTarget(l)}
                                                    onTagClick={(t) => {
                                                        setActiveTag(t);
                                                        setExpandedId(null);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </SimpleBar>
                                )}
                            </section>
                        );
                    })}
                    {grouped.length === 0 && <div className="emptyState">No logs found.</div>}
                </SimpleBar>
            </section>
            {/* create log modal */}
            {isCreateOpen && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsCreateOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">New log</h3>
                        <form className="modalForm" onSubmit={createLog}>
                            <label className="field">
                                <span className="fieldLabel">Date</span>
                                <input
                                    className="fieldInput"
                                    value={draft.date}
                                    onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
                                    placeholder="dd.mm.yyyy"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Title *</span>
                                <input
                                    className="fieldInput"
                                    value={draft.title}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Evening sail"
                                    required
                                />
                                <div className={`wordCount ${wordCount(draft.title) > TITLE_MAX_WORDS ? "over" : ""}`}>
                                    {wordCount(draft.title)}/{TITLE_MAX_WORDS} words
                                </div>
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Weather</span>
                                <input
                                    className="fieldInput"
                                    value={draft.weather}
                                    onChange={(e) => setDraft((p) => ({ ...p, weather: e.target.value }))}
                                    placeholder="e.g. Sunny, 18°C"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Coordinates</span>
                                <input
                                    className="fieldInput"
                                    value={draft.coords}
                                    onChange={(e) => setDraft((p) => ({ ...p, coords: e.target.value }))}
                                    placeholder="e.g. 60.17, 24.94"
                                />
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
                                    placeholder="Write your log..."
                                    required
                                    rows={6}
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
            {/* confirm delete modal */}
            {deleteTarget && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setDeleteTarget(null)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Delete log?</h3>
                        <p className="modalText">
                            Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone.
                        </p>
                        <div className="modalActions">
                            <button className="btn" type="button" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </button>
                            <button className="btn btnDelete" type="button" onClick={deleteLogConfirmed}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}