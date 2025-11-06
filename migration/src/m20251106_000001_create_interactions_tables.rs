use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Follow::Table)
                    .if_not_exists()
                    .col(big_integer(Follow::Id).auto_increment().primary_key())
                    .col(big_integer(Follow::UserId).not_null())
                    .col(text(Follow::Actor).not_null())
                    .col(string_len(Follow::ActivityId, 2048))
                    .col(
                        date_time(Follow::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_follow_user_id")
                            .from(Follow::Table, Follow::UserId)
                            .to(User::Table, User::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_follow_user_actor")
                    .table(Follow::Table)
                    .col(Follow::UserId)
                    .col(Follow::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(NoteLike::Table)
                    .if_not_exists()
                    .col(big_integer(NoteLike::Id).auto_increment().primary_key())
                    .col(big_integer(NoteLike::NoteId).not_null())
                    .col(text(NoteLike::Actor).not_null())
                    .col(string_len(NoteLike::ActivityId, 2048))
                    .col(
                        date_time(NoteLike::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_note_like_note_id")
                            .from(NoteLike::Table, NoteLike::NoteId)
                            .to(Note::Table, Note::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_like_note_actor")
                    .table(NoteLike::Table)
                    .col(NoteLike::NoteId)
                    .col(NoteLike::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(NoteAnnounce::Table)
                    .if_not_exists()
                    .col(big_integer(NoteAnnounce::Id).auto_increment().primary_key())
                    .col(big_integer(NoteAnnounce::NoteId).not_null())
                    .col(text(NoteAnnounce::Actor).not_null())
                    .col(string_len(NoteAnnounce::ActivityId, 2048))
                    .col(
                        date_time(NoteAnnounce::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_note_announce_note_id")
                            .from(NoteAnnounce::Table, NoteAnnounce::NoteId)
                            .to(Note::Table, Note::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_announce_note_actor")
                    .table(NoteAnnounce::Table)
                    .col(NoteAnnounce::NoteId)
                    .col(NoteAnnounce::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_follow_activity_id")
                    .table(Follow::Table)
                    .col(Follow::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_like_activity_id")
                    .table(NoteLike::Table)
                    .col(NoteLike::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_announce_activity_id")
                    .table(NoteAnnounce::Table)
                    .col(NoteAnnounce::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(NoteAnnounce::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(NoteLike::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Follow::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Follow {
    Table,
    Id,
    UserId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum NoteLike {
    Table,
    Id,
    NoteId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum NoteAnnounce {
    Table,
    Id,
    NoteId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Note {
    Table,
    Id,
}
