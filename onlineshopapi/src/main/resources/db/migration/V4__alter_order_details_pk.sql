ALTER TABLE order_details DROP CONSTRAINT order_details_pkey;
ALTER TABLE order_details ADD PRIMARY KEY (order_id, product_id, shipped_from_id);
