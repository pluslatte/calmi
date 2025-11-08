use crate::domain::entities::note_likes;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait NoteLikesRepository: Send + Sync {
    async fn add_like(&self, note_id: i64, actor: &str, activity_id: &str) -> Result<(), DbErr>;

    async fn remove_like_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr>;

    async fn remove_like(&self, note_id: i64, actor: &str) -> Result<u64, DbErr>;

    async fn find_like_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<note_likes::Model>, DbErr>;

    async fn find_like(
        &self,
        note_id: i64,
        actor: &str,
    ) -> Result<Option<note_likes::Model>, DbErr>;

    async fn list_likes(&self, note_id: i64) -> Result<Vec<note_likes::Model>, DbErr>;
}
