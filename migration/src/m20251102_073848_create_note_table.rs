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
                    .col(pk_auto(Note::Id))
                    .col(text(Note::Content))
                    .col(integer(Note::AuthorId))
                    .col(date_time(Note::CreatedAt))
                    .col(
                        ColumnDef::new(Note::To)
                            .array(ColumnType::String(StringLen::N(2048)))
                            .not_null()
                            .default("{}"),
                    )
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
    To,
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
}
