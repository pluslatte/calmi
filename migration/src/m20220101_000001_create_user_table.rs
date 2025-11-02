use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(User::Table)
                    .if_not_exists()
                    .col(string_len(User::Id, 2048).primary_key())
                    .col(string_len(User::DisplayName, 255))
                    .col(string_len(User::Username, 255).unique_key())
                    .col(string_len(User::InboxUrl, 2048))
                    .col(string_len(User::OutboxUrl, 2048))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(User::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
    DisplayName,
    Username,
    InboxUrl,
    OutboxUrl,
}
