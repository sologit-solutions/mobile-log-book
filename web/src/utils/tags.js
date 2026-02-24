export function normalizeTags(tagsTextOrArray) {
    const arr = Array.isArray(tagsTextOrArray)
        ? tagsTextOrArray
        : String(tagsTextOrArray ?? "")
            .split(",")
            .map((t) => t.trim());

    return arr
        .filter(Boolean)
        .map((t) => t[0].toUpperCase() + t.slice(1))
        .filter((t, i, a) => a.indexOf(t) === i);
}

export function buildTopTags(items, maxTags = 20) {
    const counts = new Map();
    for (const it of items) {
        const tags = Array.isArray(it.tags) ? it.tags : [];
        for (const t of tags) {
            const key = String(t || "").trim();
            if (!key) continue;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
    }
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, maxTags)
        .map(([tag]) => tag);
}