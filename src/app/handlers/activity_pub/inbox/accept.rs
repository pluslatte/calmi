use crate::app::object_receivers;
use axum::http::StatusCode;
use calmi_activity_streams::types::object::accept::Accept;

pub async fn handle(accept: Accept, username: &str) -> Result<StatusCode, StatusCode> {
    match object_receivers::activity_pub::inbox::handle_accept(accept, username).await {
        Ok(_) => {
            println!("Accept activity processed");
            Ok(StatusCode::ACCEPTED)
        }
        Err(e) => {
            eprintln!("Failed to handle Accept activity: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
