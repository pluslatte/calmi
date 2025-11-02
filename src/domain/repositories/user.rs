use async_trait::async_trait;
use sea_orm::DbErr;

use crate::domain::entities::user;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: &str) -> Result<Option<user::Model>, DbErr>;
    async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>, DbErr>;
    async fn create(&self, user: user::ActiveModel) -> Result<user::Model, DbErr>;
    async fn update(&self, user: user::ActiveModel) -> Result<user::Model, DbErr>;
    async fn delete(&self, id: &str) -> Result<(), DbErr>;
    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<user::Model>, DbErr>;
}
