export { useMarkAllNotificationsRead } from './api/use-mark-all-notifications-read';
export { useMarkNotificationRead } from './api/use-mark-notification-read';
export { useNotificationsView } from './api/use-notifications-view';

export type { V44Response as NotificationsView } from '@/shared/api';

import type { V44Response } from '@/shared/api';

/** V-44 item, as its generated schema validates it (id, type, severity, text, createdAt, isRead, target). */
export type NotificationItem = V44Response['items'][number];
