import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { ProductDto } from '../../../../../core/types/dtos/product.dto';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { HasRoleDirective } from '../../../../auth/directives/has-role.directive';
import { UserRole } from '../../../../../core/types/enums/user-roles.enum';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CardComponent, HasRoleDirective],
    templateUrl: './product-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
    product = input.required<ProductDto>();
    viewDetails = output<string>();
    addToCart = output<string>();
    edit = output<string>();
    delete = output<string>();

    imageUrl = computed(() => this.product().imageUrl || '/placeholder-product.svg');
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
