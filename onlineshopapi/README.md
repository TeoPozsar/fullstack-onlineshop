# Online Shop API

## API Documentation

You can explore and test all available endpoints using the Swagger interface:
- Swagger UI: http://localhost:3000/api/swagger-ui/index.html

## Local Setup

### Starting the App

You can start the backend locally in one of two ways:

#### Option 1: Using Maven

Activate the `local` profile to use preconfigured dev credentials:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

#### Option 2: Using IntelliJ Run Configurations

Use the predefined IntelliJ run configurations from the `.run/` folder:

| Configuration | Description                                                     |
|---------------|-----------------------------------------------------------------|
| `api:local`   | Runs the app via IntelliJ with `-Dspring.profiles.active=local` |

### Mock Users (local profile)

The V1.1 migration seeds the following users:

| Email                  | Role       | Password   |
|------------------------|------------|------------|
| `admin@onlineshop.com` | `ADMIN`    | `password` |
| `john.doe@email.com`   | `CUSTOMER` | `password` |
| `jane.smith@email.com` | `CUSTOMER` | `password` |

## Database Schema

> To render Mermaid diagrams in IntelliJ, install the [Mermaid plugin](https://plugins.jetbrains.com/plugin/20146-mermaid).

```mermaid
erDiagram
    product_categories {
        UUID id PK
        VARCHAR name
        VARCHAR description
    }

    products {
        UUID id PK
        VARCHAR name
        VARCHAR description
        DECIMAL price
        DOUBLE weight
        UUID category_id FK
        VARCHAR image_url
    }

    locations {
        UUID id PK
        VARCHAR name
        VARCHAR country
        VARCHAR city
        VARCHAR county
        VARCHAR street_address
    }

    stocks {
        UUID product_id PK,FK
        UUID location_id PK,FK
        INTEGER quantity
    }

    users {
        UUID id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR password
        VARCHAR email
        VARCHAR role
    }

    orders {
        UUID id PK
        UUID user_id FK
        TIMESTAMP created_at
        VARCHAR country
        VARCHAR city
        VARCHAR county
        VARCHAR street_address
    }

    order_details {
        UUID order_id PK,FK
        UUID product_id PK,FK
        UUID shipped_from_id FK
        INTEGER quantity
    }

    product_categories ||--o{ products : "has"
    products ||--o{ stocks : "stocked at"
    locations ||--o{ stocks : "holds"
    users ||--o{ orders : "places"
    orders ||--o{ order_details : "contains"
    products ||--o{ order_details : "ordered in"
    locations ||--o{ order_details : "ships from"
```
## Production Configuration

For deployed environments, all sensitive values must be provided via environment variables.

| Variable               | Description                     |
|------------------------|---------------------------------|
| `DB_HOST`              | Database host address           |
| `DB_PORT`              | Database port                   |
| `DB_NAME`              | Database name                   |
| `DB_USERNAME`          | Database username               |
| `DB_PASSWORD`          | Database password               |
| `JWT_SECRET`           | Secret key used for JWT signing |
| `CORS_ALLOWED_ORIGINS` | Allowed client origins for CORS |
