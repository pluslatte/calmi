use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::activitypub::actor::build_actor;
use crate::activitypub::types::Actor;
use crate::app_state::AppState;
use crate::domain::user::UserRepository;

pub async fn actor_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<Actor>, StatusCode> {
    let user =
        UserRepository::find_by_username(&state.storage, &username).ok_or(StatusCode::NOT_FOUND)?;

    let actor = build_actor(&state.config, &user);
    Ok(Json(actor))
}
