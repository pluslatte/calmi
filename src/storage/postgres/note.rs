use crate::domain::entities::notes;
use crate::domain::repositories::notes::NotesRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};

#[async_trait]
impl NotesRepository for PostgresStorage {
    async fn find_note_by_id(&self, id: i64) -> Result<Option<notes::Model>, DbErr> {
        notes::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_note_by_author_id(
        &self,
        author_id: i64,
        limit: u64,
        offset: u64,
    ) -> Result<Vec<notes::Model>, DbErr> {
        notes::Entity::find()
            .filter(notes::Column::AuthorId.eq(author_id))
            .order_by_desc(notes::Column::CreatedAt)
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }

    async fn add_note(
        &self,
        content: &str,
        author_id: i64,
        to: Vec<String>,
    ) -> Result<notes::Model, DbErr> {
        let note = notes::ActiveModel {
            id: ActiveValue::NotSet,
            content: ActiveValue::Set(content.to_string()),
            author_id: ActiveValue::Set(author_id),
            created_at: ActiveValue::Set(Utc::now().naive_utc()),
            to: ActiveValue::Set(to),
        };
        note.insert(&self.db).await
    }

    async fn update_note(&self, note: notes::ActiveModel) -> Result<notes::Model, DbErr> {
        note.update(&self.db).await
    }

    async fn delete_note(&self, id: i64) -> Result<(), DbErr> {
        notes::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn list_note(&self, limit: u64, offset: u64) -> Result<Vec<notes::Model>, DbErr> {
        notes::Entity::find()
            .order_by_desc(notes::Column::CreatedAt)
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }
}
