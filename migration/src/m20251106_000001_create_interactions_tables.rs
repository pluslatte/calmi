use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Follows::Table)
                    .if_not_exists()
                    .col(big_integer(Follows::Id).auto_increment().primary_key())
                    .col(big_integer(Follows::UserId).not_null())
                    .col(text(Follows::Actor).not_null())
                    .col(string_len(Follows::ActivityId, 2048))
                    .col(
                        date_time(Follows::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_follows_user_id")
                            .from(Follows::Table, Follows::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_follows_user_actor")
                    .table(Follows::Table)
                    .col(Follows::UserId)
                    .col(Follows::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(NoteLikes::Table)
                    .if_not_exists()
                    .col(big_integer(NoteLikes::Id).auto_increment().primary_key())
                    .col(big_integer(NoteLikes::NoteId).not_null())
                    .col(text(NoteLikes::Actor).not_null())
                    .col(string_len(NoteLikes::ActivityId, 2048))
                    .col(
                        date_time(NoteLikes::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_note_likes_note_id")
                            .from(NoteLikes::Table, NoteLikes::NoteId)
                            .to(Notes::Table, Notes::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_likes_note_actor")
                    .table(NoteLikes::Table)
                    .col(NoteLikes::NoteId)
                    .col(NoteLikes::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(NoteAnnounces::Table)
                    .if_not_exists()
                    .col(
                        big_integer(NoteAnnounces::Id)
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(big_integer(NoteAnnounces::NoteId).not_null())
                    .col(text(NoteAnnounces::Actor).not_null())
                    .col(string_len(NoteAnnounces::ActivityId, 2048))
                    .col(
                        date_time(NoteAnnounces::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_note_announces_note_id")
                            .from(NoteAnnounces::Table, NoteAnnounces::NoteId)
                            .to(Notes::Table, Notes::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_announces_note_actor")
                    .table(NoteAnnounces::Table)
                    .col(NoteAnnounces::NoteId)
                    .col(NoteAnnounces::Actor)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_follows_activity_id")
                    .table(Follows::Table)
                    .col(Follows::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_likes_activity_id")
                    .table(NoteLikes::Table)
                    .col(NoteLikes::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_note_announces_activity_id")
                    .table(NoteAnnounces::Table)
                    .col(NoteAnnounces::ActivityId)
                    .unique()
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(NoteAnnounces::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(NoteLikes::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Follows::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Follows {
    Table,
    Id,
    UserId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum NoteLikes {
    Table,
    Id,
    NoteId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum NoteAnnounces {
    Table,
    Id,
    NoteId,
    Actor,
    ActivityId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Notes {
    Table,
    Id,
}
