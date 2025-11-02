use async_trait::async_trait;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};

use crate::domain::entities::{note, user};
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};

#[derive(Clone)]
pub struct PostgresStorage {
    db: DatabaseConnection,
}

impl PostgresStorage {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl UserRepository for PostgresStorage {
    async fn find_by_id(&self, id: &str) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find()
            .filter(user::Column::Username.eq(username))
            .one(&self.db)
            .await
    }

    async fn create(&self, user: user::ActiveModel) -> Result<user::Model, DbErr> {
        user.insert(&self.db).await
    }

    async fn update(&self, user: user::ActiveModel) -> Result<user::Model, DbErr> {
        user.update(&self.db).await
    }

    async fn delete(&self, id: &str) -> Result<(), DbErr> {
        user::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<user::Model>, DbErr> {
        user::Entity::find()
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }
}

#[async_trait]
impl NoteRepository for PostgresStorage {
    async fn find_by_id(&self, id: &str) -> Result<Option<note::Model>, DbErr> {
        note::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_by_author_id(
        &self,
        author_id: &str,
        limit: u64,
        offset: u64,
    ) -> Result<Vec<note::Model>, DbErr> {
        note::Entity::find()
            .filter(note::Column::AuthorId.eq(author_id))
            .order_by_desc(note::Column::CreatedAt)
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }

    async fn create(&self, note: note::ActiveModel) -> Result<note::Model, DbErr> {
        note.insert(&self.db).await
    }

    async fn update(&self, note: note::ActiveModel) -> Result<note::Model, DbErr> {
        note.update(&self.db).await
    }

    async fn delete(&self, id: &str) -> Result<(), DbErr> {
        note::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<note::Model>, DbErr> {
        note::Entity::find()
            .order_by_desc(note::Column::CreatedAt)
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }
}
