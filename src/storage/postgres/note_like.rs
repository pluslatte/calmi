use crate::domain::entities::note_like;
use crate::domain::repositories::note_like::NoteLikeRepository;
use crate::storage::postgres::PostgresStorage;
use async_trait::async_trait;
use chrono::Utc;
use sea_orm::sea_query::OnConflict;
use sea_orm::{
    ActiveValue, ColumnTrait, DbErr, EntityTrait, QueryFilter, QueryOrder,
};

#[async_trait]
impl NoteLikeRepository for PostgresStorage {
    async fn add_like(
        &self,
        note_id: i64,
        actor: &str,
        activity_id: Option<&str>,
    ) -> Result<(), DbErr> {
        let model = note_like::ActiveModel {
            id: ActiveValue::NotSet,
            note_id: ActiveValue::Set(note_id),
            actor: ActiveValue::Set(actor.to_string()),
            activity_id: ActiveValue::Set(activity_id.map(|id| id.to_string())),
            created_at: ActiveValue::Set(Utc::now().naive_utc()),
        };

        note_like::Entity::insert(model)
            .on_conflict(
                OnConflict::columns([note_like::Column::NoteId, note_like::Column::Actor])
                    .do_nothing()
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map(|_| ())
    }

    async fn remove_like_by_activity_id(&self, activity_id: &str) -> Result<u64, DbErr> {
        let result = note_like::Entity::delete_many()
            .filter(note_like::Column::ActivityId.eq(activity_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn remove_like(&self, note_id: i64, actor: &str) -> Result<u64, DbErr> {
        let result = note_like::Entity::delete_many()
            .filter(note_like::Column::NoteId.eq(note_id))
            .filter(note_like::Column::Actor.eq(actor))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    async fn find_like_by_activity_id(
        &self,
        activity_id: &str,
    ) -> Result<Option<note_like::Model>, DbErr> {
        note_like::Entity::find()
            .filter(note_like::Column::ActivityId.eq(activity_id))
            .one(&self.db)
            .await
    }

    async fn find_like(
        &self,
        note_id: i64,
        actor: &str,
    ) -> Result<Option<note_like::Model>, DbErr> {
        note_like::Entity::find()
            .filter(note_like::Column::NoteId.eq(note_id))
            .filter(note_like::Column::Actor.eq(actor))
            .one(&self.db)
            .await
    }

    async fn list_likes(&self, note_id: i64) -> Result<Vec<note_like::Model>, DbErr> {
        note_like::Entity::find()
            .filter(note_like::Column::NoteId.eq(note_id))
            .order_by_desc(note_like::Column::CreatedAt)
            .all(&self.db)
            .await
    }
}
