import { MOCK_CATEGORIES, MOCK_SUPPLIERS } from '../../data/products.mock';
import { handleProductsFeature } from './products-handler.mock';

describe('handleProductsFeature suppliers', () => {
    it('returns available suppliers for GET /suppliers', () => {
        const response = handleProductsFeature({
            method: 'GET',
            path: '/suppliers',
            body: null
        });

        expect(response?.status).toBe(200);
        expect(response?.body).toEqual(MOCK_SUPPLIERS);
    });

    it('rejects product creation with an invalid supplier', () => {
        const response = handleProductsFeature({
            method: 'POST',
            path: '/products',
            body: {
                name: 'Test Product',
                description: 'Test description',
                price: 10,
                weight: 1,
                imageUrl: 'https://example.com/image.jpg',
                categoryId: MOCK_CATEGORIES[0].id,
                supplierId: 'unknown'
            }
        });

        expect(response?.status).toBe(400);
        expect(response?.body).toEqual({ message: 'Invalid supplier' });
    });

    it('returns 400 for product updates without a valid supplier', () => {
        const response = handleProductsFeature({
            method: 'PUT',
            path: '/products/prod-1',
            body: { supplierId: 'unknown' }
        });

        expect(response?.status).toBe(400);
        expect(response?.body).toEqual({ message: 'Invalid supplier' });
    });

    it('updates the supplier assigned to a product', () => {
        const supplier = MOCK_SUPPLIERS[1];
        const response = handleProductsFeature({
            method: 'PUT',
            path: '/products/prod-1',
            body: { supplierId: supplier.id }
        });

        expect(response?.status).toBe(200);
        expect(response?.body).toMatchObject({ supplier });
    });
});
