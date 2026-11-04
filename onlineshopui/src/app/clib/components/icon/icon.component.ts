import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
    IconName,
    AppIcons,
    IconSize,
    AppIconSizePixels
} from '../../../core/config/constants/icons.constants';

@Component({
    selector: 'app-icon',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
        <lucide-icon
            [img]="icon()"
            [size]="sizePx()"
            [strokeWidth]="strokeWidth()"
            [class]="className()"
            [attr.aria-label]="ariaLabel() || null"
            [attr.aria-hidden]="ariaLabel() ? null : 'true'"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
    name = input.required<IconName>();
    size = input<IconSize>('sm');
    className = input<string>('');
    ariaLabel = input<string | null>(null);
    strokeWidth = input<number>(1.5);

    readonly icon = computed(() => AppIcons[this.name()]);
    readonly sizePx = computed(() => AppIconSizePixels[this.size()]);
}
