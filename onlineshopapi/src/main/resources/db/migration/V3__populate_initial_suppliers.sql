INSERT INTO suppliers (id, name, contact_email, phone, country, city, street_address)
VALUES ('5a110001-0000-0000-0000-000000000001', 'TechNova Distribution', 'sales@technova.example', '+40 264 555 0101',
        'Romania', 'Cluj-Napoca', 'Strada Fabricii 25'),
       ('5a110002-0000-0000-0000-000000000002', 'UrbanThread Apparel', 'orders@urbanthread.example', NULL,
        'Poland', 'Lodz', NULL),
       ('5a110003-0000-0000-0000-000000000003', 'GreenField Home & Sport Supply', NULL, '+49 30 555 0199',
        'Germany', 'Berlin', 'Industriestrasse 12')
ON CONFLICT (id) DO NOTHING;
