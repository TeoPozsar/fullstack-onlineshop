import { ChangeDetectionStrategy, Component, input, output, HostListener } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-modal',
    imports: [IconComponent],
    templateUrl: './modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
    isOpen = input.required<boolean>();
    title = input.required<string>();
    confirmText = input<string>('Confirm');
    cancelText = input<string>('Cancel');
    isProcessing = input<boolean>(false);

    confirmed = output<void>();
    cancelled = output<void>();
    closed = output<void>();

    @HostListener('document:keydown.escape')
    onEscapeKey(): void {
        if (this.isOpen()) {
            this.closed.emit();
        }
    }

    onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.closed.emit();
        }
    }

    onConfirm(): void {
        this.confirmed.emit();
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
