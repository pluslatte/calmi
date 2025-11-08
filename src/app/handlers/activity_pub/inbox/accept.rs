use axum::http::StatusCode;
use calmi_activity_streams::types::object::accept::Accept;

pub async fn handle(_accept: Accept, _username: &str) -> Result<StatusCode, StatusCode> {
    println!("Accept activity processed");
    Ok(StatusCode::ACCEPTED)
}
