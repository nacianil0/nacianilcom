export type ScheduleMode = 'same-day' | 'daily' | 'weekly';
export interface ScheduleEntry {
    articleId: string;
    publishDate: string;
    status: 'published' | 'scheduled';
}
export declare function addDays(isoDate: string, days: number): string;
export declare function resolvePublishStatus(publishDate: string, now?: Date): 'published' | 'scheduled';
export declare function computeScheduleDates(startDate: string, count: number, mode: ScheduleMode): string[];
export declare function sortArticleIds(articleIds: string[], articleOrder?: string[]): string[];
export declare function buildSchedule(articleIds: string[], startDate: string, mode: ScheduleMode, now?: Date): ScheduleEntry[];
export declare function formatScheduleMode(mode: ScheduleMode): string;
//# sourceMappingURL=publishScheduler.d.ts.map