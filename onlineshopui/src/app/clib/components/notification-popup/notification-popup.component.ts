import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationsService } from '../../../core/services/notifications.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-notification-popup',
    standalone: true,
    imports: [IconComponent, TranslocoPipe],
    templateUrl: './notification-popup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationPopupComponent {
    private readonly notificationsService = inject(NotificationsService);

    readonly notifications = this.notificationsService.notifications;

    dismiss(id: string): void {
        this.notificationsService.dismiss(id);
    }
}
