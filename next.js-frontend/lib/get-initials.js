/**
 * "Pavan Kumar"      -> "PK"
 * "John David Smith" -> "JS"  (first + last, middle names ignored)
 * "Mary"              -> "M"
 */
export function getInitials(fullName) {
    if (!fullName || typeof fullName !== "string") return "?";

    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();

    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return `${first}${last}`.toUpperCase();
}