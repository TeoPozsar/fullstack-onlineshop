export type ProductCategoryDto = {
    id: string;
    name: string;
    description: string;
};

export type ProductDto = {
    id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    category: ProductCategoryDto;
    imageUrl: string;
};

export type CreateProductRequest = Omit<ProductDto, 'id' | 'category'> & { categoryId: string };

export type UpdateProductRequest = Partial<ProductDto> & { categoryId?: string };
