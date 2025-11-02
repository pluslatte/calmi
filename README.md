# calmi
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