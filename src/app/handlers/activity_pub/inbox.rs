use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::app::types::InboxActivity;
use crate::app_state::AppState;
use crate::domain::repositories::user::UserRepository;

pub async fn inbox_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    let user_exists = state
        .storage
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !user_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    println!("Received activity for {}: {:?}", username, activity);

    Ok(StatusCode::ACCEPTED)
}
