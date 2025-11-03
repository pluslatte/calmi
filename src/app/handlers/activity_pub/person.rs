use axum::{
    Json,
    extract::{Path, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};

use crate::activity_pub::mapper::build_person;
use crate::app::state::AppState;
use crate::domain::repositories::user::UserRepository;

pub async fn get(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
    let user = state
        .storage
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let person = build_person(&state.config, &user);
    Ok((
        [(header::CONTENT_TYPE, "application/activity+json")],
        Json(person),
    )
        .into_response())
}
