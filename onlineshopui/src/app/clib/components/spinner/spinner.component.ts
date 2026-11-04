import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-spinner',
    imports: [],
    templateUrl: './spinner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
    size = input<'sm' | 'md' | 'lg'>('md');
    overlay = input<boolean>(false);

    readonly sizeClass = computed(() => {
        const sizeMap = {
            sm: 'w-4 h-4',
            md: 'w-8 h-8',
            lg: 'w-12 h-12'
        };

        return sizeMap[this.size()];
    });
}
