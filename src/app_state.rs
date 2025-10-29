use crate::config::Config;
use crate::storage::memory::MemoryStorage;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub storage: MemoryStorage,
}

impl AppState {
    pub fn new(config: Config, storage: MemoryStorage) -> Self {
        Self { config, storage }
    }
}
