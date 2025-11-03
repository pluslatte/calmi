use async_trait::async_trait;
use sea_orm::DbErr;

use crate::domain::entities::note;

#[async_trait]
pub trait NoteRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<note::Model>, DbErr>;
    async fn find_by_author_id(
        &self,
        author_id: i64,
        limit: u64,
        offset: u64,
    ) -> Result<Vec<note::Model>, DbErr>;
    async fn create(
        &self,
        content: &str,
        author_id: i64,
        to: Vec<String>,
    ) -> Result<note::Model, DbErr>;
    async fn update(&self, note: note::ActiveModel) -> Result<note::Model, DbErr>;
    async fn delete(&self, id: i64) -> Result<(), DbErr>;
    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<note::Model>, DbErr>;
}
