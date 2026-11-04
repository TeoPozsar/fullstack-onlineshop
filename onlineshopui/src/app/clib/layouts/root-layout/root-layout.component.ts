import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NotificationPopupComponent } from '../../components/notification-popup/notification-popup.component';

@Component({
    selector: 'app-root-layout',
    imports: [RouterOutlet, NavbarComponent, NotificationPopupComponent],
    templateUrl: './root-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootLayoutComponent {}
