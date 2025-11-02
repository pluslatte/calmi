use crate::config::Config;
use crate::storage::postgres::PostgresStorage;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub storage: PostgresStorage,
}

impl AppState {
    pub fn new(config: Config, storage: PostgresStorage) -> Self {
        Self { config, storage }
    }
}
