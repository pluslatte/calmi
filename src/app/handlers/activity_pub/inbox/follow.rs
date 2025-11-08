use crate::app::object_receivers;
use crate::domain::entities::user::Model as User;
use crate::domain::repositories::FollowRepository;
use axum::http::StatusCode;
use calmi_activity_streams::types::object::follow::Follow;

pub async fn handle<T: FollowRepository>(
    follow: Follow,
    base_url: &str,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    match object_receivers::activity_pub::inbox::handle_follow(follow, base_url, username).await {
        Ok(data) => {
            if data.followee_username != username {
                eprintln!(
                    "Follow target mismatch: expected {}, received {}",
                    username, data.followee_username
                );
                return Err(StatusCode::BAD_REQUEST);
            }

            if let Err(err) = storage
                .add_follow(inbox_owner.id, &data.follower_id, &data.activity_id)
                .await
            {
                eprintln!("Failed to persist follow: {}", err);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }

            println!(
                "Follow recorded: {} now follows {}",
                data.follower_id, data.followee_username
            );
            Ok(StatusCode::ACCEPTED)
        }
        Err(e) => {
            eprintln!("Failed to handle Follow activity: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
