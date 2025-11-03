use axum::{
    Json,
    extract::{Query, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};
use calmi_webfinger::types::WebFingerQuery;

use crate::domain::repositories::user::UserRepository;
use crate::{app::object_builders::webfinger::build_webfinger_response, app::state::AppState};

pub async fn get(
    Query(query): Query<WebFingerQuery>,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
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

    let user_exists = state
        .storage
        .find_by_username(username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !user_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    let response = build_webfinger_response(&state.config, username);
    Ok((
        [(header::CONTENT_TYPE, "application/jrd+json")],
        Json(response),
    )
        .into_response())
}
