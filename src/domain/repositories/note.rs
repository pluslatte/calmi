use async_trait::async_trait;
use sea_orm::DbErr;

use crate::domain::entities::note;

#[async_trait]
pub trait NoteRepository: Send + Sync {
    async fn find_by_id(&self, id: &str) -> Result<Option<note::Model>, DbErr>;
    async fn find_by_author_id(
        &self,
        author_id: &str,
        limit: u64,
        offset: u64,
    ) -> Result<Vec<note::Model>, DbErr>;
    async fn create(&self, note: note::ActiveModel) -> Result<note::Model, DbErr>;
    async fn update(&self, note: note::ActiveModel) -> Result<note::Model, DbErr>;
    async fn delete(&self, id: &str) -> Result<(), DbErr>;
    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<note::Model>, DbErr>;
}
