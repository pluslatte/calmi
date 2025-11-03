use crate::domain::entities::user;
use crate::domain::repositories::user::UserRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QuerySelect,
};

#[async_trait]
impl UserRepository for PostgresStorage {
    async fn find_by_id(&self, id: i64) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find()
            .filter(user::Column::Username.eq(username))
            .one(&self.db)
            .await
    }

    async fn create(&self, username: &str, display_name: &str) -> Result<user::Model, DbErr> {
        let user = user::ActiveModel {
            id: ActiveValue::NotSet,
            username: ActiveValue::Set(username.to_string()),
            display_name: ActiveValue::Set(display_name.to_string()),
        };
        user.insert(&self.db).await
    }

    async fn update(&self, user: user::ActiveModel) -> Result<user::Model, DbErr> {
        user.update(&self.db).await
    }

    async fn delete(&self, id: i64) -> Result<(), DbErr> {
        user::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn list(&self, limit: u64, offset: u64) -> Result<Vec<user::Model>, DbErr> {
        user::Entity::find()
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }
}
