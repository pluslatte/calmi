use axum::{Json, extract::Path, http::StatusCode};

use crate::types::InboxActivity;
use crate::users;

pub async fn inbox_handler(
    Path(username): Path<String>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    if !users::user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    println!("Received activity for {}: {:?}", username, activity);

    Ok(StatusCode::ACCEPTED)
}
