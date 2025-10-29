use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
};

use crate::activitypub::types::{WebFingerQuery, WebFingerResponse};
use crate::activitypub::webfinger::build_webfinger_response;
use crate::app_state::AppState;
use crate::domain::user::UserRepository;

pub async fn webfinger(
    Query(query): Query<WebFingerQuery>,
    State(state): State<AppState>,
) -> Result<Json<WebFingerResponse>, StatusCode> {
    let resource = &query.resource;

    if !resource.starts_with("acct:") {
        return Err(StatusCode::BAD_REQUEST);
    }

    let acct = resource.trim_start_matches("acct:");
    let parts: Vec<&str> = acct.split('@').collect();

    if parts.len() != 2 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let username = parts[0];
    let domain = parts[1];

    if domain != state.config.domain {
        return Err(StatusCode::NOT_FOUND);
    }

    if !UserRepository::exists(&state.storage, username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let response = build_webfinger_response(&state.config, username);
    Ok(Json(response))
}
