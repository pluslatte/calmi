use crate::domain::entities::note_announces;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait NoteAnnouncesRepository: Send + Sync {
    async fn add_announce(&self, note_id: i64, actor: &str, activity_id: &str)
    -> Result<(), DbErr>;

    async fn remove_announce_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr>;

    async fn remove_announce(&self, note_id: i64, actor: &str) -> Result<u64, DbErr>;

    async fn find_announce_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<note_announces::Model>, DbErr>;

    async fn find_announce(
        &self,
        note_id: i64,
        actor: &str,
    ) -> Result<Option<note_announces::Model>, DbErr>;

    async fn list_announces(&self, note_id: i64) -> Result<Vec<note_announces::Model>, DbErr>;
}
