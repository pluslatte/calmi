use crate::domain::entities::users;
use async_trait::async_trait;
use sea_orm::DbErr;

#[async_trait]
pub trait UsersRepository: Send + Sync {
    async fn find_user_by_id(&self, id: i64) -> Result<Option<users::Model>, DbErr>;
    async fn find_user_by_username(&self, username: &str) -> Result<Option<users::Model>, DbErr>;
    async fn add_user(&self, username: &str, display_name: &str) -> Result<users::Model, DbErr>;
    async fn update_user(&self, user: users::ActiveModel) -> Result<users::Model, DbErr>;
    async fn delete_user(&self, id: i64) -> Result<(), DbErr>;
    async fn list_user(&self, limit: u64, offset: u64) -> Result<Vec<users::Model>, DbErr>;
}
