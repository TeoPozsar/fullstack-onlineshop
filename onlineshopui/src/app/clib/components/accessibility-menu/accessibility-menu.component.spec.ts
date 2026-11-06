import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AccessibilityMenuComponent } from './accessibility-menu.component';
import { ThemeService } from '../../services/theme.service';

describe('AccessibilityMenuComponent', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<AccessibilityMenuComponent>>;
    let service: ThemeService;
    let storage: Record<string, string>;

    beforeEach(() => {
        storage = {};

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
            return storage[key] ?? null;
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
            storage[key] = value;
        });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
            delete storage[key];
        });
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: vi.fn((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        });

        document.documentElement.className = '';
        TestBed.configureTestingModule({
            imports: [AccessibilityMenuComponent],
            providers: [ThemeService]
        });
        fixture = TestBed.createComponent(AccessibilityMenuComponent);
        service = TestBed.inject(ThemeService);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.documentElement.className = '';
    });

    function getTrigger(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button');
    }

    function openMenu(): void {
        getTrigger().click();
        fixture.detectChanges();
    }

    it('should render an accessible menu trigger', () => {
        const trigger = getTrigger();

        expect(trigger.type).toBe('button');
        expect(trigger.textContent).toContain('Accessibility');
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('aria-controls')).toMatch(/^accessibility-menu-panel-/);
    });

    it('should render labelled controls when opened', () => {
        openMenu();

        const panel = fixture.nativeElement.querySelector('[role="dialog"]');
        const fontSizeInputs = fixture.nativeElement.querySelectorAll(
            'input[name="accessibility-font-size"]'
        );

        expect(panel.getAttribute('aria-labelledby')).toBe(
            fixture.nativeElement.querySelector('h2').id
        );
        expect(fontSizeInputs.length).toBe(4);
        expect(fixture.nativeElement.querySelector('[aria-label="High contrast"]')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('[aria-label="Reduced motion"]')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('[aria-label="Close accessibility settings"]')).toBeTruthy();
        expect(fixture.nativeElement.textContent).toContain('Reset to defaults');
        expect(getTrigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('should generate unique IDs for multiple component instances', () => {
        openMenu();
        const firstTrigger = getTrigger();
        const firstPanelId = firstTrigger.getAttribute('aria-controls');

        const secondFixture = TestBed.createComponent(AccessibilityMenuComponent);
        secondFixture.detectChanges();
        const secondTrigger = secondFixture.nativeElement.querySelector('button');

        expect(firstPanelId).not.toBe(secondTrigger.getAttribute('aria-controls'));
        expect(firstPanelId).toBe(
            fixture.nativeElement.querySelector('[role="dialog"]').id
        );
        secondFixture.destroy();
    });

    it('should open with Enter and Space on the trigger', () => {
        const trigger = getTrigger();

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        fixture.detectChanges();

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('should update font size and motion settings through ThemeService', () => {
        openMenu();

        const largeFontSize = fixture.nativeElement.querySelector(
            'input[name="accessibility-font-size"][value="large"]'
        ) as HTMLInputElement;
        const highContrast = fixture.nativeElement.querySelector(
            '[aria-label="High contrast"]'
        ) as HTMLInputElement;
        const reducedMotion = fixture.nativeElement.querySelector(
            '[aria-label="Reduced motion"]'
        ) as HTMLInputElement;

        largeFontSize.click();
        highContrast.click();
        reducedMotion.click();
        fixture.detectChanges();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'large',
            highContrast: true,
            reducedMotion: true
        });
        expect(largeFontSize.checked).toBe(true);
        expect(highContrast.checked).toBe(true);
        expect(reducedMotion.checked).toBe(true);
    });

    it('should reset settings through ThemeService', () => {
        service.setFontSize('extra-large');
        service.setHighContrast(true);
        service.setReducedMotion(true);
        openMenu();

        const resetButton = Array.from(
            fixture.nativeElement.querySelectorAll(
                'button'
            ) as NodeListOf<HTMLButtonElement>
        ).find(button => button.textContent?.includes('Reset to defaults'));

        expect(resetButton).toBeDefined();
        resetButton!.click();
        fixture.detectChanges();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false
        });
    });

    it('should focus the first control when opened and restore focus on close', async () => {
        openMenu();
        await fixture.whenStable();

        const firstControl = fixture.nativeElement.querySelector(
            'input[name="accessibility-font-size"]'
        ) as HTMLInputElement;
        expect(document.activeElement).toBe(firstControl);

        const closeButton = fixture.nativeElement.querySelector(
            '[aria-label="Close accessibility settings"]'
        ) as HTMLButtonElement;
        closeButton.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(getTrigger());
        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    });

    it('should close on Escape and restore focus to the trigger', async () => {
        openMenu();
        await fixture.whenStable();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
        expect(document.activeElement).toBe(getTrigger());
    });

    it('should remain open when clicking inside and close when clicking outside', () => {
        openMenu();
        const panel = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
        panel.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();

        document.body.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    });
});
