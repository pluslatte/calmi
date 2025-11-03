# calmi
Small federated social networking server.  
Focuses on connecting small clusters of communities with each other.
## Development
### Launch dev database
```bash
docker compose up -d
```
### DB
Requires postgres.
- Install `sea-orm-cli`, if not already:
```bash
cargo install sea-orm-cli
```
#### Migrations
- Located in the `migrations/src/`.
- To add new migration:
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