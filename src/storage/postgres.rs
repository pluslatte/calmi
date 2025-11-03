use crate::domain::entities::{note, user};
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
    QueryFilter, QueryOrder, QuerySelect,
};

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
    async fn find_by_id(&self, id: i64) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find()
            .filter(user::Column::Username.eq(username))
            .one(&self.db)
            .await
    }

    async fn create(&self, username: &str, display_name: &str) -> Result<user::Model, DbErr> {
        let user = user::ActiveModel {
            id: ActiveValue::NotSet,
            username: ActiveValue::Set(username.to_string()),
            display_name: ActiveValue::Set(display_name.to_string()),
        };
        user.insert(&self.db).await
    }

    async fn update(&self, user: user::ActiveModel) -> Result<user::Model, DbErr> {
        user.update(&self.db).await
    }

    async fn delete(&self, id: i64) -> Result<(), DbErr> {
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
    async fn find_by_id(&self, id: i64) -> Result<Option<note::Model>, DbErr> {
        note::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_by_author_id(
        &self,
        author_id: i64,
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

    async fn create(
        &self,
        content: &str,
        author_id: i64,
        to: Vec<String>,
    ) -> Result<note::Model, DbErr> {
        let note = note::ActiveModel {
            id: ActiveValue::NotSet,
            content: ActiveValue::Set(content.to_string()),
            author_id: ActiveValue::Set(author_id),
            created_at: ActiveValue::Set(Utc::now().naive_utc()),
            to: ActiveValue::Set(to),
        };
        note.insert(&self.db).await
    }

    async fn update(&self, note: note::ActiveModel) -> Result<note::Model, DbErr> {
        note.update(&self.db).await
    }

    async fn delete(&self, id: i64) -> Result<(), DbErr> {
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
