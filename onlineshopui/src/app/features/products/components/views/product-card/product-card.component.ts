import { Component, input, output, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProductDto } from '../../../../../core/types/dtos/product.dto';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { HasRoleDirective } from '../../../../auth/directives/has-role.directive';
import { UserRole } from '../../../../../core/types/enums/user-roles.enum';
import { LanguageService } from '../../../../../core/services/language.service';
import { formatCurrency } from '../../../../../core/utils/locale-format.utils';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CardComponent, HasRoleDirective, TranslocoPipe],
    templateUrl: './product-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
    private readonly languageService = inject(LanguageService);
    product = input.required<ProductDto>();
    viewDetails = output<string>();
    addToCart = output<string>();
    edit = output<string>();
    delete = output<string>();

    imageUrl = computed(() => this.product().imageUrl || '/placeholder-product.svg');
    formattedPrice = computed(() =>
        formatCurrency(this.product().price, this.languageService.activeLanguage())
    );
    readonly UserRole = UserRole;

    onViewDetails(): void {
        this.viewDetails.emit(this.product().id);
    }

    onAddToCart(): void {
        this.addToCart.emit(this.product().id);
    }

    onEdit(): void {
        this.edit.emit(this.product().id);
    }

    onDelete(): void {
        this.delete.emit(this.product().id);
    }
}
