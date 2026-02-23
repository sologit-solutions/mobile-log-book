import React, { useMemo, useState } from "react";
import LogMap from "./LogMap";
import { useLogs } from "../contexts/LogsContext";
import { previewText, wordCount } from "../utils/text";
import { normalizeTags } from "../utils/tags";
import { pad2 } from "../utils/dates";

/* function to parse a coordinate string */
function parseCoords(coords) {
    if (!coords) return null;
    const m = coords.match(/(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/);
    if (!m) return null;
    const lat = Number(m[1]);
    const lon = Number(m[3]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
}

export default function LogCard({ log, isOpen, onToggle, registerRef, onDelete, onTagClick }) {
    const { updateLog } = useLogs();
    const c = useMemo(() => parseCoords(log.coords), [log.coords]);

    /* amount of words is limited for aesthetics reasons */
    const TITLE_MAX_WORDS = 8;
    const BODY_MAX_WORDS = 350;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [draft, setDraft] = useState({
        date: log.date ?? "",
        title: log.title ?? "",
        weather: log.weather ?? "",
        coords: log.coords ?? "",
        tagsText: (log.tags || []).join(", "),
        text: log.text ?? "",
    });

    /* opens edit modal */
    function openEdit(e) {
        e.stopPropagation();
        setDraft({
            date: log.date ?? "",
            title: log.title ?? "",
            weather: log.weather ?? "",
            coords: log.coords ?? "",
            tagsText: (log.tags || []).join(", "),
            text: log.text ?? "",
        });
        setIsEditOpen(true);
    }

    /* saves edited log */
    function saveEdit(e) {
        e.preventDefault();
        const title = draft.title.trim();
        const text = draft.text.trim();
        if (!title || !text) return;
        if (wordCount(title) > TITLE_MAX_WORDS || wordCount(text) > BODY_MAX_WORDS) return;
        const patch = {
            date: draft.date.trim(),
            title,
            weather: draft.weather.trim() || "—",
            coords: draft.coords.trim() || "—",
            tags: normalizeTags(draft.tagsText),
            text,
        };
        updateLog(log.id, patch);
        setIsEditOpen(false);
    }

    /* updates time stamp via edits */
    function formatStamp(updatedAt) {
        if (!updatedAt) return null;
        const d = new Date(updatedAt);
        if (!Number.isFinite(d.getTime())) return null;
        const now = new Date();
        const sameDay =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
        if (sameDay) return time;
        const date = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
        return `${date} ${time}`;
    }
    /* disables save button if word amount goes pass the limits */
    const tooLong =
        wordCount(draft.title) > TITLE_MAX_WORDS || wordCount(draft.text) > BODY_MAX_WORDS;

    return (
        <>
            <article
                /* card opens and closes if clicked or Enter is pressed */
                ref={registerRef}
                className={`logCard glowOnHover ${isOpen ? "open" : "closed"}`}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                aria-expanded={isOpen}
            >
                <div className="logSummary">
                    {!isOpen && (
                        /* mini map thumb when card is closed */
                        <div className="mapThumb small" aria-hidden="true">
                            <div className="mapDot" />
                        </div>
                    )}

                    <div className="logSummaryMain">
                        <div className="logSummaryTop">
                            {/* title and last modified stamp */}
                            <span className="compactTitle">{log.title}</span>
                            {formatStamp(log.updatedAt) && (
                                <span className="logStamp glowOnHover" title="Last modified">
                                    {formatStamp(log.updatedAt)}
                                </span>
                            )}
                        </div>

                        {/* text will be shorter in collapsed cards */}
                        {!isOpen && <div className="logPreview">{previewText(log.text, 120)}</div>}

                        {/* max 6 tags per card */}
                        {(log.tags?.length ?? 0) > 0 && (
                            <div className="noteTags" style={{ marginTop: 8 }}>
                                {log.tags.slice(0, 6).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className="tagPill glowOnHover"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTagClick?.(t);
                                        }}
                                        title={`Tag: ${t}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* metadata aka weather and coords */}
                        <div className={`logMetaRow ${isOpen ? "show" : "hide"}`}>
                            <span className="metaItem">
                                <span className="metaIcon" aria-hidden="true">
                                    <i className="gg-sun" />
                                </span>
                                <span className="metaText">{log.weather}</span>
                            </span>

                            <span className="metaItem">
                                <span className="metaIcon" aria-hidden="true">
                                    <i className="gg-pin" />
                                </span>
                                <span className="metaText">{log.coords}</span>
                            </span>
                        </div>
                    </div>

                    {/* card action buttons; chevron(expand/collapse), edit(pen), delete(minus) */}
                    <div className="logActions" onClick={(e) => e.stopPropagation()}>
                        <button
                            className={`chevBtn glowOnHover ${isOpen ? "open" : ""}`}
                            type="button"
                            aria-label={isOpen ? "Collapse log" : "Expand log"}
                            title={isOpen ? "Collapse" : "Expand"}
                            onClick={onToggle}
                        >
                            <i className="gg-chevron-down" />
                        </button>

                        <button
                            className="iconBtn glowOnHover"
                            type="button"
                            aria-label="Edit log"
                            title="Edit"
                            onClick={openEdit}
                        >
                            <i className="gg-pen" />
                        </button>

                        <button
                            className="iconBtn iconBtn--delete"
                            type="button"
                            aria-label="Delete log"
                            title="Delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                        >
                            <i className="gg-delete" />
                        </button>
                    </div>
                </div>

                {/* expanded details */}
                <div className={`logDetails ${isOpen ? "open" : ""}`}>
                    <div className="logDetailsInner">
                        <div className="logDetailsGrid">
                            {/* map shows if coords match */}
                            {c ? (
                                <LogMap lat={c.lat} lon={c.lon} className="mapThumb mapThumbExpanded detailsFade" />
                            ) : (
                                <div className="mapThumb mapThumbExpanded detailsFade" aria-hidden="true">
                                    <div className="mapDot" />
                                </div>
                            )}

                            <pre className="logText detailsFade detailsFade--delay">{log.text}</pre>
                        </div>
                    </div>
                </div>
            </article>

            {/* edit modal */}
            {isEditOpen && (
                <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setIsEditOpen(false)}>
                    <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Edit log</h3>
                        <form className="modalForm" onSubmit={saveEdit}>
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
                                />
                            </label>

                            <label className="field">
                                <span className="fieldLabel">Coordinates</span>
                                <input
                                    className="fieldInput"
                                    value={draft.coords}
                                    onChange={(e) => setDraft((p) => ({ ...p, coords: e.target.value }))}
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
                                    required
                                    rows={6}
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
        </>
    );
}