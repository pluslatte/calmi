use crate::activitypub::types::ActorObject;
use crate::config::Config;
use crate::domain::user::User;

pub fn build_actor(config: &Config, user: &User) -> ActorObject {
    ActorObject {
        context: vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ],
        id: format!("{}/users/{}", config.base_url, user.username),
        r#type: "Person".to_string(),
        preferred_username: user.username.clone(),
        name: user.name.clone(),
        summary: user.summary.clone(),
        inbox: format!("{}/users/{}/inbox", config.base_url, user.username),
        outbox: format!("{}/users/{}/outbox", config.base_url, user.username),
    }
}
