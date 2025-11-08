use crate::domain::entities::users;
use crate::domain::repositories::users::UsersRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QuerySelect,
};

#[async_trait]
impl UsersRepository for PostgresStorage {
    async fn find_user_by_id(&self, id: i64) -> Result<Option<users::Model>, DbErr> {
        users::Entity::find_by_id(id).one(&self.db).await
    }

    async fn find_user_by_username(&self, username: &str) -> Result<Option<users::Model>, DbErr> {
        users::Entity::find()
            .filter(users::Column::Username.eq(username))
            .one(&self.db)
            .await
    }

    async fn add_user(&self, username: &str, display_name: &str) -> Result<users::Model, DbErr> {
        let user = users::ActiveModel {
            id: ActiveValue::NotSet,
            username: ActiveValue::Set(username.to_string()),
            display_name: ActiveValue::Set(display_name.to_string()),
        };
        user.insert(&self.db).await
    }

    async fn update_user(&self, user: users::ActiveModel) -> Result<users::Model, DbErr> {
        user.update(&self.db).await
    }

    async fn delete_user(&self, id: i64) -> Result<(), DbErr> {
        users::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn list_user(&self, limit: u64, offset: u64) -> Result<Vec<users::Model>, DbErr> {
        users::Entity::find()
            .limit(limit)
            .offset(offset)
            .all(&self.db)
            .await
    }
}
