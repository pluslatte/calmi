use sea_orm::DatabaseConnection;

pub mod note;
pub mod user;

#[derive(Clone)]
pub struct PostgresStorage {
    db: DatabaseConnection,
}

impl PostgresStorage {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
