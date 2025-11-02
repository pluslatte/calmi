use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Note::Table)
                    .if_not_exists()
                    .col(string(Note::Id).primary_key())
                    .col(string(Note::Content))
                    .col(string(Note::AuthorId))
                    .col(date_time(Note::CreatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_note_author_id")
                            .from(Note::Table, Note::AuthorId)
                            .to(User::Table, User::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Note::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Note {
    Table,
    Id,
    Content,
    AuthorId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
}
