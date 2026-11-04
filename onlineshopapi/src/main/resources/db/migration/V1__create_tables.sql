CREATE TABLE product_categories
(
    id          UUID         PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000)
);

CREATE TABLE products
(
    id          UUID              PRIMARY KEY,
    name        VARCHAR(255)      NOT NULL,
    description VARCHAR(1000),
    price       DECIMAL(10, 2)    NOT NULL,
    weight      DOUBLE PRECISION,
    category_id UUID              NOT NULL REFERENCES product_categories (id),
    image_url   VARCHAR(500)
);

CREATE TABLE locations
(
    id             UUID         PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    country        VARCHAR(100),
    city           VARCHAR(100),
    county         VARCHAR(100),
    street_address VARCHAR(255)
);

CREATE TABLE stocks
(
    product_id  UUID    NOT NULL REFERENCES products (id),
    location_id UUID    NOT NULL REFERENCES locations (id),
    quantity    INTEGER NOT NULL,
    PRIMARY KEY (product_id, location_id)
);

CREATE TABLE users
(
    id            UUID         PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    role          VARCHAR(50)  NOT NULL
);

CREATE TABLE orders
(
    id             UUID         PRIMARY KEY,
    user_id        UUID         NOT NULL REFERENCES users (id),
    created_at     TIMESTAMP    NOT NULL,
    country        VARCHAR(100),
    city           VARCHAR(100),
    county         VARCHAR(100),
    street_address VARCHAR(255)
);

CREATE TABLE order_details
(
    order_id        UUID    NOT NULL REFERENCES orders (id),
    product_id      UUID    NOT NULL REFERENCES products (id),
    shipped_from_id UUID    NOT NULL REFERENCES locations (id),
    quantity        INTEGER NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
