use crate::domain::entities::notes;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait NotesRepository: Send + Sync {
    async fn find_note_by_id(&self, id: i64) -> Result<Option<notes::Model>, DbErr>;
    async fn find_note_by_author_id(
        &self,
        author_id: i64,
        limit: u64,
        offset: u64,
    ) -> Result<Vec<notes::Model>, DbErr>;
    async fn add_note(
        &self,
        content: &str,
        author_id: i64,
        to: Vec<String>,
    ) -> Result<notes::Model, DbErr>;
    async fn update_note(&self, note: notes::ActiveModel) -> Result<notes::Model, DbErr>;
    async fn delete_note(&self, id: i64) -> Result<(), DbErr>;
    async fn list_note(&self, limit: u64, offset: u64) -> Result<Vec<notes::Model>, DbErr>;
}
