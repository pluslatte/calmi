use crate::domain::entities::note;
use crate::domain::repositories::note::NoteRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};

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
