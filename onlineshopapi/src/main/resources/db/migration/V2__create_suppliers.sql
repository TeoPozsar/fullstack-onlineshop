CREATE TABLE suppliers
(
    id             UUID         PRIMARY KEY,
    name           VARCHAR(255) NOT NULL UNIQUE,
    contact_email  VARCHAR(255),
    phone          VARCHAR(50),
    country        VARCHAR(100),
    city           VARCHAR(100),
    street_address VARCHAR(255)
);

ALTER TABLE products ADD COLUMN supplier_id UUID REFERENCES suppliers (id);

-- Only created when products already exist, so fresh installations get no placeholder supplier.
INSERT INTO suppliers (id, name)
SELECT '1e9acc00-0000-0000-0000-000000000000', 'Legacy Default Supplier'
WHERE EXISTS (SELECT 1 FROM products);

UPDATE products
SET supplier_id = '1e9acc00-0000-0000-0000-000000000000'
WHERE supplier_id IS NULL;

ALTER TABLE products ALTER COLUMN supplier_id SET NOT NULL;

CREATE INDEX idx_products_supplier_id ON products (supplier_id);
