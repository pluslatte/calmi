use crate::domain::entities::follow;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait FollowRepository: Send + Sync {
    async fn add_follow(
        &self,
        user_id: i64,
        actor: &str,
        activity_id: Option<&str>,
    ) -> Result<(), DbErr>;

    async fn remove_follow_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr>;

    async fn remove_follow(&self, user_id: i64, actor: &str) -> Result<u64, DbErr>;

    async fn find_follow_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<follow::Model>, DbErr>;

    async fn find_follow(&self, user_id: i64, actor: &str) -> Result<Option<follow::Model>, DbErr>;

    async fn list_followers(&self, user_id: i64) -> Result<Vec<follow::Model>, DbErr>;
}
