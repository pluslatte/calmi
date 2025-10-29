use axum::{Json, extract::Path, http::StatusCode};

use crate::types::ActorObject;
use crate::users;

const DOMAIN: &str = "example.com";

pub async fn actor_handler(Path(username): Path<String>) -> Result<Json<ActorObject>, StatusCode> {
    let user = users::get_user_info(&username).ok_or(StatusCode::NOT_FOUND)?;

    let actor = ActorObject {
        context: vec!["https://www.w3.org/ns/activitystreams".to_string()],
        id: format!("https://{}/users/{}", DOMAIN, username),
        r#type: "Person".to_string(),
        preferred_username: user.username.clone(),
        name: user.name,
        summary: user.summary,
        inbox: format!("https://{}/users/{}/inbox", DOMAIN, username),
        outbox: format!("https://{}/users/{}/outbox", DOMAIN, username),
    };

    Ok(Json(actor))
}
