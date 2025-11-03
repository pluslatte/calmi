# calmi
A small federated social networking server.  
Focuses on connecting small clusters of communities with each other, assuming it is hosted by individuals who are core members of their community.

## Development

### Launch dev database
```bash
docker compose up -d
```

### DB
Requires PostgreSQL.

- Install `sea-orm-cli`, if not already installed:
```bash
cargo install sea-orm-cli
```

#### Migrations
- Located in `migrations/src/`.
- To add a new migration:
```bash
sea-orm-cli migrate generate <migration_name>
```
- On change, run:
```bash
sea-orm-cli migrate up # this will apply pending migrations
sea-orm-cli generate entity -o src/domain/entities # this will generate src/domain/entities/*
```

### Testing
Tests use isolated databases (each test creates a temporary `test_*` database). To clean up accumulated test databases:
```bash
docker compose stop postgres-test
docker compose rm -v postgres-test
docker volume rm calmi_postgres_test_data
docker compose up -d postgres-test
```