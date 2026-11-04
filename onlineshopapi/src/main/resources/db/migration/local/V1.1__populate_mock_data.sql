INSERT INTO product_categories (id, name, description)
VALUES ('ca7e0001-0000-0000-0000-000000000001', 'Electronics', 'Electronic devices and gadgets'),
       ('ca7e0002-0000-0000-0000-000000000002', 'Clothing', 'Apparel and fashion items'),
       ('ca7e0003-0000-0000-0000-000000000003', 'Home & Garden', 'Home improvement and garden supplies'),
       ('ca7e0004-0000-0000-0000-000000000004', 'Sports', 'Sports equipment and accessories');

INSERT INTO products (id, name, description, price, weight, category_id, image_url)
VALUES ('fade0001-0000-0000-0000-000000000001', 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 149.99,
        0.25, 'ca7e0001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/headphones/400/300'),
       ('fade0002-0000-0000-0000-000000000002', 'Smart Watch', 'Feature-rich smartwatch with health tracking', 299.99,
        0.05, 'ca7e0001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/smartwatch/400/300'),
       ('fade0003-0000-0000-0000-000000000003', 'Bluetooth Speaker', 'Portable bluetooth speaker with deep bass', 79.99,
        0.5, 'ca7e0001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/speaker/400/300'),
       ('fade0004-0000-0000-0000-000000000004', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 24.99,
        0.2, 'ca7e0002-0000-0000-0000-000000000002', 'https://picsum.photos/seed/tshirt/400/300'),
       ('fade0005-0000-0000-0000-000000000005', 'Denim Jeans', 'Classic fit denim jeans', 59.99,
        0.6, 'ca7e0002-0000-0000-0000-000000000002', 'https://picsum.photos/seed/jeans/400/300'),
       ('fade0006-0000-0000-0000-000000000006', 'Garden Hose', 'Durable 50ft garden hose with spray nozzle', 34.99,
        2.5, 'ca7e0003-0000-0000-0000-000000000003', 'https://picsum.photos/seed/hose/400/300'),
       ('fade0007-0000-0000-0000-000000000007', 'LED Desk Lamp', 'Adjustable LED desk lamp with multiple brightness levels', 44.99,
        0.8, 'ca7e0003-0000-0000-0000-000000000003', 'https://picsum.photos/seed/lamp/400/300'),
       ('fade0008-0000-0000-0000-000000000008', 'Yoga Mat', 'Non-slip yoga mat with carrying strap', 29.99,
        1.2, 'ca7e0004-0000-0000-0000-000000000004', 'https://picsum.photos/seed/yogamat/400/300'),
       ('fade0009-0000-0000-0000-000000000009', 'Running Shoes', 'Lightweight running shoes with cushioned sole', 89.99,
        0.7, 'ca7e0004-0000-0000-0000-000000000004', 'https://picsum.photos/seed/shoes/400/300'),
       ('fade000a-0000-0000-0000-00000000000a', 'Fitness Tracker', 'Water-resistant fitness tracker with heart rate monitor', 69.99,
        0.03, 'ca7e0004-0000-0000-0000-000000000004', 'https://picsum.photos/seed/tracker/400/300');

INSERT INTO locations (id, name, country, city, county, street_address)
VALUES ('10ca0001-0000-0000-0000-000000000001', 'Warehouse Cluj', 'Romania', 'Cluj-Napoca', 'Cluj',
        'Strada Fabricii 10'),
       ('10ca0002-0000-0000-0000-000000000002', 'Warehouse Bucharest', 'Romania', 'Bucharest', 'Ilfov',
        'Calea Victoriei 100');

INSERT INTO stocks (product_id, location_id, quantity)
VALUES ('fade0001-0000-0000-0000-000000000001', '10ca0001-0000-0000-0000-000000000001', 50),
       ('fade0002-0000-0000-0000-000000000002', '10ca0001-0000-0000-0000-000000000001', 150),
       ('fade0003-0000-0000-0000-000000000003', '10ca0002-0000-0000-0000-000000000002', 300),
       ('fade0004-0000-0000-0000-000000000004', '10ca0002-0000-0000-0000-000000000002', 200),
       ('fade0005-0000-0000-0000-000000000005', '10ca0001-0000-0000-0000-000000000001', 75),
       ('fade0006-0000-0000-0000-000000000006', '10ca0001-0000-0000-0000-000000000001', 100),
       ('fade0007-0000-0000-0000-000000000007', '10ca0002-0000-0000-0000-000000000002', 120),
       ('fade0008-0000-0000-0000-000000000008', '10ca0001-0000-0000-0000-000000000001', 80),
       ('fade0009-0000-0000-0000-000000000009', '10ca0002-0000-0000-0000-000000000002', 60),
       ('fade000a-0000-0000-0000-00000000000a', '10ca0001-0000-0000-0000-000000000001', 200);

-- passwords are bcrypt hash of "password"
INSERT INTO users (id, first_name, last_name, password, email, role)
VALUES ('face0001-0000-0000-0000-000000000001', 'Admin', 'User',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'admin@onlineshop.com', 'ADMIN'),
       ('face0002-0000-0000-0000-000000000002', 'John', 'Doe',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'john.doe@email.com', 'CUSTOMER'),
       ('face0003-0000-0000-0000-000000000003', 'Jane', 'Smith',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'jane.smith@email.com', 'CUSTOMER');

INSERT INTO orders (id, user_id, created_at, country, city, county, street_address)
VALUES ('decade01-0000-0000-0000-000000000001', 'face0002-0000-0000-0000-000000000002', '2026-01-15 10:30:00',
        'Romania', 'Cluj-Napoca', 'Cluj', 'Strada Mihai Eminescu 5'),
       ('decade02-0000-0000-0000-000000000002', 'face0003-0000-0000-0000-000000000003', '2026-02-20 14:00:00',
        'Romania', 'Bucharest', 'Ilfov', 'Bulevardul Unirii 22');

INSERT INTO order_details (order_id, product_id, shipped_from_id, quantity)
VALUES ('decade01-0000-0000-0000-000000000001', 'fade0001-0000-0000-0000-000000000001',
        '10ca0001-0000-0000-0000-000000000001', 1),
       ('decade01-0000-0000-0000-000000000001', 'fade0002-0000-0000-0000-000000000002',
        '10ca0001-0000-0000-0000-000000000001', 2),
       ('decade02-0000-0000-0000-000000000002', 'fade0004-0000-0000-0000-000000000004',
        '10ca0002-0000-0000-0000-000000000002', 1);
