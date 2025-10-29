use axum::{Json, extract::Path, http::StatusCode};

use crate::types::OutboxCollection;
use crate::users;

const DOMAIN: &str = "example.com";

pub async fn outbox_handler(
    Path(username): Path<String>,
) -> Result<Json<OutboxCollection>, StatusCode> {
    if !users::user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let outbox = OutboxCollection {
        context: "https://www.w3.org/ns/activitystreams".to_string(),
        id: format!("https://{}/users/{}/outbox", DOMAIN, username),
        r#type: "OrderedCollection".to_string(),
        total_items: 0,
    };

    Ok(Json(outbox))
}
