use sea_orm::DatabaseConnection;

pub mod follow;
pub mod note;
pub mod note_announce;
pub mod note_like;
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
