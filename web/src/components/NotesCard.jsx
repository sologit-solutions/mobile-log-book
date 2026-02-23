import React, { useMemo } from "react";
import { previewText } from "../utils/text";
import { formatStamp } from "../utils/dates";

export default function NoteCard({
    note,
    isOpen = false,
    onToggle,
    registerRef,
    onEdit,
    onDelete,
    nowMs,
    onTagClick,
                                 })
{
    const canToggle = typeof onToggle === "function";
    const ts = note?.updatedAt ?? note?.createdAt;
    const centerStamp = useMemo(() => formatStamp(ts, nowMs), [ts, nowMs]);
    const fullStamp = useMemo(() => formatStamp(ts, null), [ts]);

    return (
        <article
            ref={registerRef}
            className={`logCard glowOnHover ${isOpen ? "open" : "closed"}`}
            onClick={canToggle ? onToggle : undefined}
            role={canToggle ? "button" : undefined}
            tabIndex={canToggle ? 0 : undefined}
            onKeyDown={
            canToggle
                ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }
            : undefined
        }
            aria-expanded={canToggle ? isOpen : undefined}
            style={{ cursor: canToggle ? "pointer" : "default" }}
        >
            <div className="logSummary logSummary--noThumb">
                <div className="logSummaryMain">
                    <div
                        className="logSummaryTop"
                        style={{ justifyContent: "space-between", width: "100%" }}
                    >
                        <span className="compactTitle">{note?.title || "Untitled"}</span>
                        <span
                            className="noteStamp glowOnHover"
                            title={`Last modified: ${fullStamp}`}
                            aria-label={`Last modified ${centerStamp}`}
                        >
                            {centerStamp}
                        </span>
                    </div>

                    {!isOpen && <div className="logPreview">{previewText(note?.text, 160)}</div>}
                    {Array.isArray(note?.tags) && note.tags.length > 0 && (
                        <div className="noteTags">
                            {note.tags.map((t) => (
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
                </div>

                {/* note card action buttons; chevron(expand/collapse), edit(pen), delete(minus) */}
                <div className="logActions" onClick={(e) => e.stopPropagation()}>
                    {canToggle && (
                        <button
                            className={`chevBtn glowOnHover ${isOpen ? "open" : ""}`}
                            type="button"
                            aria-label={isOpen ? "Collapse note" : "Expand note"}
                            title={isOpen ? "Collapse" : "Expand"}
                            onClick={onToggle}
                        >
                            <i className="gg-chevron-down" />
                        </button>
                    )}

                    {onEdit && (
                        <button
                            className="iconBtn glowOnHover"
                            type="button"
                            aria-label="Edit note"
                            title="Edit"
                            onClick={onEdit}
                        >
                            <i className="gg-pen" />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            className="iconBtn iconBtn--delete"
                            type="button"
                            aria-label="Delete note"
                            title="Delete"
                            onClick={onDelete}
                        >
                            <i className="gg-delete" />
                        </button>
                    )}
                </div>
            </div>

            {/* expand */}
            <div className={`logDetails ${isOpen ? "open" : ""}`}>
                <div className="logDetailsInner">
                    <pre className="logText">{note?.text}</pre>
                </div>
            </div>
        </article>
    );
}