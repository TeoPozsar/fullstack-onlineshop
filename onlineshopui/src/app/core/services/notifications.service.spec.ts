import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NotificationsService } from './notifications.service';
import {
    MOCK_NOTIFICATION_INPUT_SUCCESS,
    MOCK_NOTIFICATION_INPUT_INFO,
    MOCK_NOTIFICATION_INPUT_ERROR
} from '../mocks/data/notifications.mock';

describe('NotificationsService', () => {
    let service: NotificationsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationsService]
        });

        service = TestBed.inject(NotificationsService);
    });

    describe('Initialization', () => {
        it('should be created', () => {
            // Prepare
            // (service created in beforeEach)

            // Action
            // (no action needed)

            // Verify
            expect(service).toBeTruthy();
        });

        it('should initialize with empty notifications', () => {
            // Prepare
            // (service created in beforeEach)

            // Action
            // (no action needed)

            // Verify
            expect(service.notifications()).toEqual([]);
        });
    });

    describe('notifySuccess()', () => {
        it('should add success notification', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess(MOCK_NOTIFICATION_INPUT_SUCCESS);

            // Verify
            const notifications = service.notifications();
            expect(notifications.length).toBe(1);
            expect(notifications[0].level).toBe('success');
            expect(notifications[0].title).toBe(MOCK_NOTIFICATION_INPUT_SUCCESS.title);
            expect(notifications[0].message).toBe(MOCK_NOTIFICATION_INPUT_SUCCESS.message);
        });

        it('should generate unique id for notification', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({ title: 'Test 1', message: 'Message 1' });
            service.notifySuccess({ title: 'Test 2', message: 'Message 2' });

            // Verify
            const notifications = service.notifications();
            expect(notifications[0].id).not.toBe(notifications[1].id);
        });

        it('should add notification to the beginning of array', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({ title: 'First', message: 'First message' });
            service.notifySuccess({ title: 'Second', message: 'Second message' });

            // Verify
            const notifications = service.notifications();
            expect(notifications[0].title).toBe('Second');
            expect(notifications[1].title).toBe('First');
        });

        it('should use default duration when not specified', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({ title: 'Test', message: 'Test message' });

            // Verify
            const notification = service.notifications()[0];
            expect(notification.durationMs).toBe(3200);
        });

        it('should use custom duration when specified', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({
                title: 'Test',
                message: 'Test message',
                durationMs: 5000
            });

            // Verify
            const notification = service.notifications()[0];
            expect(notification.durationMs).toBe(5000);
        });

        it('should auto-dismiss after duration', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifySuccess({
                title: 'Test',
                message: 'Test message',
                durationMs: 1000
            });

            expect(service.notifications().length).toBe(1);

            vi.advanceTimersByTime(1000);

            // Verify
            expect(service.notifications().length).toBe(0);

            vi.useRealTimers();
        });

        it('should not auto-dismiss when duration is 0', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifySuccess({
                title: 'Test',
                message: 'Test message',
                durationMs: 0
            });

            expect(service.notifications().length).toBe(1);

            vi.advanceTimersByTime(10000); // Wait longer than default duration

            // Verify
            expect(service.notifications().length).toBe(1);

            vi.useRealTimers();
        });

        it('should set createdAt timestamp', () => {
            // Prepare
            const beforeTime = Date.now();

            // Action
            service.notifySuccess({ title: 'Test', message: 'Test message' });
            const afterTime = Date.now();

            // Verify
            const notification = service.notifications()[0];
            expect(notification.createdAt).toBeGreaterThanOrEqual(beforeTime);
            expect(notification.createdAt).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('notifyInfo()', () => {
        it('should add info notification', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifyInfo(MOCK_NOTIFICATION_INPUT_INFO);

            // Verify
            const notifications = service.notifications();
            expect(notifications.length).toBe(1);
            expect(notifications[0].level).toBe('info');
            expect(notifications[0].title).toBe(MOCK_NOTIFICATION_INPUT_INFO.title);
            expect(notifications[0].message).toBe(MOCK_NOTIFICATION_INPUT_INFO.message);
        });

        it('should auto-dismiss after duration', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifyInfo({
                title: 'Info',
                message: 'Info message',
                durationMs: 500
            });

            expect(service.notifications().length).toBe(1);

            vi.advanceTimersByTime(500);

            // Verify
            expect(service.notifications().length).toBe(0);

            vi.useRealTimers();
        });
    });

    describe('notifyError()', () => {
        it('should add error notification', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifyError(MOCK_NOTIFICATION_INPUT_ERROR);

            // Verify
            const notifications = service.notifications();
            expect(notifications.length).toBe(1);
            expect(notifications[0].level).toBe('error');
            expect(notifications[0].title).toBe(MOCK_NOTIFICATION_INPUT_ERROR.title);
            expect(notifications[0].message).toBe(MOCK_NOTIFICATION_INPUT_ERROR.message);
        });

        it('should auto-dismiss after duration', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifyError({
                title: 'Error',
                message: 'Error message',
                durationMs: 2000
            });

            expect(service.notifications().length).toBe(1);

            vi.advanceTimersByTime(2000);

            // Verify
            expect(service.notifications().length).toBe(0);

            vi.useRealTimers();
        });
    });

    describe('dismiss()', () => {
        it('should dismiss notification by id', () => {
            // Prepare
            service.notifySuccess({ title: 'Test 1', message: 'Message 1' });
            service.notifyInfo({ title: 'Test 2', message: 'Message 2' });
            service.notifyError({ title: 'Test 3', message: 'Message 3' });

            const notifications = service.notifications();
            expect(notifications.length).toBe(3);

            const idToDismiss = notifications[1].id;

            // Action
            service.dismiss(idToDismiss);

            // Verify
            const remaining = service.notifications();
            expect(remaining.length).toBe(2);
            expect(remaining.find(n => n.id === idToDismiss)).toBeUndefined();
        });

        it('should handle dismissing non-existent notification', () => {
            // Prepare
            service.notifySuccess({ title: 'Test', message: 'Message' });

            expect(service.notifications().length).toBe(1);

            // Action
            service.dismiss('non-existent-id');

            // Verify
            expect(service.notifications().length).toBe(1);
        });

        it('should not affect other notifications', () => {
            // Prepare
            service.notifySuccess({ title: 'Keep 1', message: 'Message 1' });
            service.notifyInfo({ title: 'Remove', message: 'Message 2' });
            service.notifyError({ title: 'Keep 2', message: 'Message 3' });

            const idToRemove = service.notifications()[1].id;

            // Action
            service.dismiss(idToRemove);

            // Verify
            const remaining = service.notifications();
            expect(remaining.length).toBe(2);
            expect(remaining[0].title).toBe('Keep 2');
            expect(remaining[1].title).toBe('Keep 1');
        });
    });

    describe('clearAll()', () => {
        it('should clear all notifications', () => {
            // Prepare
            service.notifySuccess({ title: 'Test 1', message: 'Message 1' });
            service.notifyInfo({ title: 'Test 2', message: 'Message 2' });
            service.notifyError({ title: 'Test 3', message: 'Message 3' });

            expect(service.notifications().length).toBe(3);

            // Action
            service.clearAll();

            // Verify
            expect(service.notifications()).toEqual([]);
        });

        it('should handle clearing when already empty', () => {
            // Prepare
            expect(service.notifications()).toEqual([]);

            // Action
            service.clearAll();

            // Verify
            expect(service.notifications()).toEqual([]);
        });
    });

    describe('Multiple notification types', () => {
        it('should handle multiple notification types simultaneously', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({ title: 'Success', message: 'Success message' });
            service.notifyInfo({ title: 'Info', message: 'Info message' });
            service.notifyError({ title: 'Error', message: 'Error message' });

            // Verify
            const notifications = service.notifications();
            expect(notifications.length).toBe(3);
            expect(notifications.some(n => n.level === 'success')).toBe(true);
            expect(notifications.some(n => n.level === 'info')).toBe(true);
            expect(notifications.some(n => n.level === 'error')).toBe(true);
        });

        it('should auto-dismiss notifications independently', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifySuccess({
                title: 'Fast',
                message: 'Fast message',
                durationMs: 1000
            });
            service.notifyInfo({
                title: 'Slow',
                message: 'Slow message',
                durationMs: 3000
            });

            expect(service.notifications().length).toBe(2);

            vi.advanceTimersByTime(1000);
            expect(service.notifications().length).toBe(1);
            expect(service.notifications()[0].title).toBe('Slow');

            vi.advanceTimersByTime(2000);

            // Verify
            expect(service.notifications().length).toBe(0);

            vi.useRealTimers();
        });
    });

    describe('Edge cases', () => {
        it('should handle notification with empty message', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifySuccess({ title: 'Test', message: '' });

            // Verify
            expect(service.notifications().length).toBe(1);
            expect(service.notifications()[0].message).toBe('');
        });

        it('should handle notification with empty title', () => {
            // Prepare
            // (service initialized in beforeEach)

            // Action
            service.notifyInfo({ title: '', message: 'Message' });

            // Verify
            expect(service.notifications().length).toBe(1);
            expect(service.notifications()[0].title).toBe('');
        });

        it('should handle negative duration as 0', () => {
            // Prepare
            vi.useFakeTimers();

            // Action
            service.notifyError({
                title: 'Test',
                message: 'Test message',
                durationMs: -100
            });

            expect(service.notifications().length).toBe(1);

            vi.advanceTimersByTime(10000);

            // Verify
            // Should not auto-dismiss with negative duration
            expect(service.notifications().length).toBe(1);

            vi.useRealTimers();
        });
    });
});
