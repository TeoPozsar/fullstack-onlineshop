export type ProductCategoryDto = {
    id: string;
    name: string;
    description: string;
};

export type SupplierDto = {
    id: string;
    name: string;
    contactEmail: string | null;
    phone: string | null;
    country: string | null;
    city: string | null;
    streetAddress: string | null;
};

export type ProductDto = {
    id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    category: ProductCategoryDto;
    supplier: SupplierDto;
    imageUrl: string;
};

export type CreateProductRequest = Omit<ProductDto, 'id' | 'category' | 'supplier'> & {
    categoryId: string;
    supplierId: string;
};

export type UpdateProductRequest = Partial<Omit<ProductDto, 'category' | 'supplier'>> & {
    categoryId?: string;
    supplierId: string;
};
