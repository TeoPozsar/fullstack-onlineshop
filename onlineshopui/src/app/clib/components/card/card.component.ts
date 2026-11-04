import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-card',
    imports: [NgClass],
    templateUrl: './card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
    padding = input<'sm' | 'md' | 'lg'>('md');
    shadow = input<boolean>(true);
    hoverable = input<boolean>(false);
    fullHeight = input<boolean>(false);

    readonly paddingClass = computed(() => {
        const paddingMap = {
            sm: 'p-3',
            md: 'p-4 md:p-6',
            lg: 'p-6 md:p-8'
        };

        return paddingMap[this.padding()];
    });
}
