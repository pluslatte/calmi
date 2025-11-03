use axum::Router;

use crate::app::handlers;
use crate::app_state::AppState;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .merge(handlers::activity_pub::routes())
        .with_state(state)
}
