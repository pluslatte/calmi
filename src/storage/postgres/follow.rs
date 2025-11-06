use crate::domain::entities::follow;
use crate::domain::repositories::follow::FollowRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::sea_query::OnConflict;
use sea_orm::{ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QueryOrder};

#[async_trait]
impl FollowRepository for PostgresStorage {
    async fn add_follow(&self, user_id: i64, actor: &str, activity_id: &str) -> Result<(), DbErr> {
        let model = follow::ActiveModel {
            id: ActiveValue::NotSet,
            user_id: ActiveValue::Set(user_id),
            actor: ActiveValue::Set(actor.to_string()),
            activity_id: ActiveValue::Set(activity_id.to_string()),
            created_at: ActiveValue::Set(Utc::now().naive_utc()),
        };

        follow::Entity::insert(model)
            .on_conflict(
                OnConflict::columns([follow::Column::UserId, follow::Column::Actor])
                    .do_nothing()
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map(|_| ())
    }

    async fn remove_follow_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr> {
        let result = follow::Entity::delete_many()
            .filter(follow::Column::ActivityId.eq(activity_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn remove_follow(&self, user_id: i64, actor: &str) -> Result<u64, DbErr> {
        let result = follow::Entity::delete_many()
            .filter(follow::Column::UserId.eq(user_id))
            .filter(follow::Column::Actor.eq(actor))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn find_follow_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<follow::Model>, DbErr> {
        follow::Entity::find()
            .filter(follow::Column::ActivityId.eq(activity_id))
            .one(&self.db)
            .await
    }

    async fn find_follow(&self, user_id: i64, actor: &str) -> Result<Option<follow::Model>, DbErr> {
        follow::Entity::find()
            .filter(follow::Column::UserId.eq(user_id))
            .filter(follow::Column::Actor.eq(actor))
            .one(&self.db)
            .await
    }

    async fn list_followers(&self, user_id: i64) -> Result<Vec<follow::Model>, DbErr> {
        follow::Entity::find()
            .filter(follow::Column::UserId.eq(user_id))
            .order_by_desc(follow::Column::CreatedAt)
            .all(&self.db)
            .await
    }
}
