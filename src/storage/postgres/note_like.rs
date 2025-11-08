use crate::domain::entities::note_likes;
use crate::domain::repositories::note_likes::NoteLikesRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::sea_query::OnConflict;
use sea_orm::{ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QueryOrder};

#[async_trait]
impl NoteLikesRepository for PostgresStorage {
    async fn add_like(&self, note_id: i64, actor: &str, activity_id: &str) -> Result<(), DbErr> {
        let model = note_likes::ActiveModel {
            id: ActiveValue::NotSet,
            note_id: ActiveValue::Set(note_id),
            actor: ActiveValue::Set(actor.to_string()),
            activity_id: ActiveValue::Set(activity_id.to_string()),
            created_at: ActiveValue::Set(Utc::now().naive_utc()),
        };

        note_likes::Entity::insert(model)
            .on_conflict(
                OnConflict::columns([note_likes::Column::NoteId, note_likes::Column::Actor])
                    .do_nothing()
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map(|_| ())
    }

    async fn remove_like_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr> {
        let result = note_likes::Entity::delete_many()
            .filter(note_likes::Column::ActivityId.eq(activity_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn remove_like(&self, note_id: i64, actor: &str) -> Result<u64, DbErr> {
        let result = note_likes::Entity::delete_many()
            .filter(note_likes::Column::NoteId.eq(note_id))
            .filter(note_likes::Column::Actor.eq(actor))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn find_like_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<note_likes::Model>, DbErr> {
        note_likes::Entity::find()
            .filter(note_likes::Column::ActivityId.eq(activity_id))
            .one(&self.db)
            .await
    }

    async fn find_like(
        &self,
        note_id: i64,
        actor: &str,
    ) -> Result<Option<note_likes::Model>, DbErr> {
        note_likes::Entity::find()
            .filter(note_likes::Column::NoteId.eq(note_id))
            .filter(note_likes::Column::Actor.eq(actor))
            .one(&self.db)
            .await
    }

    async fn list_likes(&self, note_id: i64) -> Result<Vec<note_likes::Model>, DbErr> {
        note_likes::Entity::find()
            .filter(note_likes::Column::NoteId.eq(note_id))
            .order_by_desc(note_likes::Column::CreatedAt)
            .all(&self.db)
            .await
    }
}
