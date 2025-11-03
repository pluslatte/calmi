use crate::domain::entities::user;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<user::Model>, DbErr>;
    async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>, DbErr>;
    async fn create(&self, username: &str, display_name: &str) -> Result<user::Model, DbErr>;
    async fn update(&self, user: user::ActiveModel) -> Result<user::Model, DbErr>;
    async fn delete(&self, id: i64) -> Result<(), DbErr>;
    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<user::Model>, DbErr>;
}
