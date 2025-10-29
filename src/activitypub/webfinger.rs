use crate::activitypub::types::{WebFingerLink, WebFingerResponse};
use crate::config::Config;

pub fn build_webfinger_response(config: &Config, username: &str) -> WebFingerResponse {
    WebFingerResponse {
        subject: format!("acct:{}@{}", username, config.domain),
        links: Some(vec![WebFingerLink {
            rel: "self".to_string(),
            r#type: Some("application/activity+json".to_string()),
            href: Some(format!("{}/users/{}", config.base_url, username)),
        }]),
    }
}
