export function makeId(prefix = "id") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}