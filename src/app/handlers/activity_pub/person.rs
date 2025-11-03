use crate::app::object_builders::activity_pub::person::build_person;
use crate::app::state::AppState;
use crate::domain::repositories::user::UserRepository;
use axum::{
    body::Body,
    extract::{Path, State},
    http::{StatusCode, header},
    response::Response,
};

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
    let json = serde_json::to_string(&person).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/activity+json")
        .body(Body::from(json))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(response)
}
