use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Notes::Table)
                    .if_not_exists()
                    .col(big_integer(Notes::Id).auto_increment().primary_key())
                    .col(text(Notes::Content))
                    .col(big_integer(Notes::AuthorId))
                    .col(date_time(Notes::CreatedAt))
                    .col(
                        ColumnDef::new(Notes::To)
                            .array(ColumnType::String(StringLen::N(2048)))
                            .not_null()
                            .default("{}"),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_notes_author_id")
                            .from(Notes::Table, Notes::AuthorId)
                            .to(Users::Table, Users::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Notes::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Notes {
    Table,
    Id,
    Content,
    AuthorId,
    CreatedAt,
    To,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
