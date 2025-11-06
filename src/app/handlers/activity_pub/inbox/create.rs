use crate::app::object_receivers;
use axum::http::StatusCode;
use calmi_activity_streams::types::object::create::Create;

pub async fn handle(create: Create, username: &str) -> Result<StatusCode, StatusCode> {
    match object_receivers::activity_pub::inbox::handle_create(create, username).await {
        Ok(data) => {
            println!(
                "Create activity: actor={}, object_type={}, object_id={:?}, activity_id={:?}",
                data.actor_id, data.object_type, data.object_id, data.activity_id
            );
            Ok(StatusCode::ACCEPTED)
        }
        Err(e) => {
            eprintln!("Failed to handle Create activity: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
