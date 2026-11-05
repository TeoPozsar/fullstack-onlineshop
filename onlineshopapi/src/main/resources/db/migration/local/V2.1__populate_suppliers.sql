INSERT INTO suppliers (id, name, contact_email, phone, country, city, street_address)
VALUES ('5a110001-0000-0000-0000-000000000001', 'TechNova Distribution', 'sales@technova.example', '+40 264 555 0101',
        'Romania', 'Cluj-Napoca', 'Strada Fabricii 25'),
       ('5a110002-0000-0000-0000-000000000002', 'UrbanThread Apparel', 'orders@urbanthread.example', NULL,
        'Poland', 'Lodz', NULL),
       ('5a110003-0000-0000-0000-000000000003', 'GreenField Home & Sport Supply', NULL, '+49 30 555 0199',
        'Germany', 'Berlin', 'Industriestrasse 12');

UPDATE products
SET supplier_id = '5a110001-0000-0000-0000-000000000001'
WHERE id IN ('fade0001-0000-0000-0000-000000000001',
             'fade0002-0000-0000-0000-000000000002',
             'fade0003-0000-0000-0000-000000000003',
             'fade000a-0000-0000-0000-00000000000a');

UPDATE products
SET supplier_id = '5a110002-0000-0000-0000-000000000002'
WHERE id IN ('fade0004-0000-0000-0000-000000000004',
             'fade0005-0000-0000-0000-000000000005');

UPDATE products
SET supplier_id = '5a110003-0000-0000-0000-000000000003'
WHERE id IN ('fade0006-0000-0000-0000-000000000006',
             'fade0007-0000-0000-0000-000000000007',
             'fade0008-0000-0000-0000-000000000008',
             'fade0009-0000-0000-0000-000000000009');

DELETE FROM suppliers
WHERE id = '1e9acc00-0000-0000-0000-000000000000'
  AND NOT EXISTS (SELECT 1 FROM products WHERE supplier_id = '1e9acc00-0000-0000-0000-000000000000');
