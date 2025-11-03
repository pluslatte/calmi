mod handlers;
mod object_builders;
mod routes;
pub mod state;
pub mod types;

pub fn create_app(state: state::AppState) -> axum::Router {
    axum::Router::new()
        .merge(routes::activity_pub::routes())
        .with_state(state)
}
