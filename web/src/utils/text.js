export function wordCount(s) {
    const t = (s ?? "").trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
}

export function previewText(text, maxChars = 140) {
    const t = (text ?? "").replace(/\s+/g, " ").trim();
    return t.length <= maxChars ? t : t.slice(0, maxChars).trimEnd() + "…";
}
