mod handlers;
mod object_builders;
mod object_receivers;
mod routes;
pub mod state;
pub mod types;

pub fn create_app(state: state::AppState) -> axum::Router {
    axum::Router::new()
        .merge(routes::routes())
        .with_state(state)
}
