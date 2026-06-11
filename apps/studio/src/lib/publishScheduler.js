"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDays = addDays;
exports.resolvePublishStatus = resolvePublishStatus;
exports.computeScheduleDates = computeScheduleDates;
exports.sortArticleIds = sortArticleIds;
exports.buildSchedule = buildSchedule;
exports.formatScheduleMode = formatScheduleMode;
function addDays(isoDate, days) {
    const d = new Date(`${isoDate}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
function resolvePublishStatus(publishDate, now = new Date()) {
    const today = now.toISOString().slice(0, 10);
    return publishDate <= today ? 'published' : 'scheduled';
}
function computeScheduleDates(startDate, count, mode) {
    if (count <= 0)
        return [];
    const step = mode === 'same-day' ? 0 : mode === 'daily' ? 1 : 7;
    return Array.from({ length: count }, (_, i) => addDays(startDate, i * step));
}
function sortArticleIds(articleIds, articleOrder) {
    if (!articleOrder?.length)
        return [...articleIds].sort();
    const rank = new Map(articleOrder.map((id, i) => [id, i]));
    return [...articleIds].sort((a, b) => {
        const ra = rank.get(a);
        const rb = rank.get(b);
        if (ra !== undefined && rb !== undefined)
            return ra - rb;
        if (ra !== undefined)
            return -1;
        if (rb !== undefined)
            return 1;
        return a.localeCompare(b);
    });
}
function buildSchedule(articleIds, startDate, mode, now = new Date()) {
    const dates = computeScheduleDates(startDate, articleIds.length, mode);
    return articleIds.map((articleId, i) => {
        const publishDate = dates[i];
        return {
            articleId,
            publishDate,
            status: resolvePublishStatus(publishDate, now),
        };
    });
}
function formatScheduleMode(mode) {
    switch (mode) {
        case 'same-day':
            return 'Hepsi aynı gün';
        case 'daily':
            return 'Günlük (art arda)';
        case 'weekly':
            return 'Haftalık';
    }
}
//# sourceMappingURL=publishScheduler.js.map