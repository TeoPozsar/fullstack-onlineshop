import { Injectable, signal } from '@angular/core';
import { Notification, NotificationInput, NotificationLevel } from '../types/notification.types';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    private readonly _notifications = signal<Notification[]>([]);

    readonly notifications = this._notifications.asReadonly();

    notifySuccess(input: NotificationInput): void {
        this.push('success', input);
    }

    notifyInfo(input: NotificationInput): void {
        this.push('info', input);
    }

    notifyError(input: NotificationInput): void {
        this.push('error', input);
    }

    dismiss(id: string): void {
        this._notifications.update(items => items.filter(item => item.id !== id));
    }

    clearAll(): void {
        this._notifications.set([]);
    }

    private push(level: NotificationLevel, input: NotificationInput): void {
        const durationMs = input.durationMs ?? 3200;
        const notification: Notification = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title: input.title,
            message: input.message,
            level,
            durationMs,
            createdAt: Date.now()
        };

        this._notifications.update(items => [notification, ...items]);

        if (durationMs > 0) {
            window.setTimeout(() => {
                this.dismiss(notification.id);
            }, durationMs);
        }
    }
}
