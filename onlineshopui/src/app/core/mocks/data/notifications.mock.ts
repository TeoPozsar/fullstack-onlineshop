import { Notification, NotificationInput } from '../../types/notification.types';

export const MOCK_NOTIFICATION_INPUT_SUCCESS: NotificationInput = {
    title: 'Success',
    message: 'Operation completed successfully'
};

export const MOCK_NOTIFICATION_INPUT_INFO: NotificationInput = {
    title: 'Information',
    message: 'This is an informational message'
};

export const MOCK_NOTIFICATION_INPUT_ERROR: NotificationInput = {
    title: 'Error',
    message: 'An error occurred'
};

export const MOCK_NOTIFICATION: Notification = {
    id: 'notif-1',
    title: 'Test Notification',
    message: 'Test message',
    level: 'info',
    durationMs: 3200,
    createdAt: Date.now()
};
