export type NotificationLevel = 'success' | 'info' | 'error';

export type Notification = {
    id: string;
    title: string;
    message?: string;
    level: NotificationLevel;
    durationMs: number;
    createdAt: number;
};

export type NotificationInput = {
    title: string;
    message?: string;
    durationMs?: number;
};
