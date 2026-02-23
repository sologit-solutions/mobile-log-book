/* helps to change single numbers to a form with 0 in front, e.g. 02 */
export function pad2(n) {
    return String(n).padStart(2, "0");
}

function isSameDay(aMs, bMs) {
    const a = new Date(aMs);
    const b = new Date(bMs);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* if same-day, returns HH:MM, else DD.MM.YYYY HH:MM */
export function formatStamp(tsMs, nowMs) {
    if (!tsMs) return null;
    const d = new Date(tsMs);
    if (!Number.isFinite(d.getTime())) return null;
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    if (nowMs && isSameDay(tsMs, nowMs)) return `${hh}:${mm}`;
    const dd = pad2(d.getDate());
    const mo = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${dd}.${mo}.${yyyy} ${hh}:${mm}`;
}

export function parseDDMMYYYY(d) {
    const [dd, mm, yyyy] = (d || "").split(".");
    const n = Number(`${yyyy}${mm}${dd}`);
    return Number.isFinite(n) ? n : -Infinity;
}

export function formatTodayDDMMYYYY() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
}

const DAY_MS = 24*60*60*1000;

/* returns absolute number of whole days between two timestamps (ms) */
export function daysBetween(aMs, bMs) {
    const day = 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs(aMs - bMs) / day);
}

/* parses "dd.mm.yyyy" into a timestamp (ms) and returns null if invalid */
export function parseDateToMs(ddmmyyyy) {
    const [dd, mm, yyyy] = String(ddmmyyyy || "").split(".");
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isFinite(dt.getTime()) ? dt.getTime() : null;
}