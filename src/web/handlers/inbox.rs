use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::app_state::AppState;
use crate::domain::user::UserRepository;
use crate::web::types::InboxActivity;

pub async fn inbox_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    if !UserRepository::exists(&state.storage, &username) {
        return Err(StatusCode::NOT_FOUND);
    }

    println!("Received activity for {}: {:?}", username, activity);

    Ok(StatusCode::ACCEPTED)
}
