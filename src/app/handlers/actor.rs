use axum::{
    Json,
    extract::{Path, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};

use crate::activitypub::actor::build_person;
use crate::app_state::AppState;
use crate::domain::user::UserRepository;

pub async fn person_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
    let user =
        UserRepository::find_by_username(&state.storage, &username).ok_or(StatusCode::NOT_FOUND)?;

    let actor = build_person(&state.config, &user);
    Ok((
        [(header::CONTENT_TYPE, "application/activity+json")],
        Json(actor),
    )
        .into_response())
}
