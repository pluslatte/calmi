use crate::config::Config;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct WebFingerQuery {
    pub resource: String,
}

#[derive(Debug, Serialize)]
pub struct WebFingerResponse {
    pub subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<WebFingerLink>>,
}

#[derive(Debug, Serialize)]
pub struct WebFingerLink {
    pub rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
}

impl WebFingerResponse {
    pub fn new(config: &Config, username: &str) -> Self {
        Self {
            subject: format!("acct:{}@{}", username, config.domain),
            links: Some(vec![WebFingerLink {
                rel: "self".to_string(),
                r#type: Some("application/activity+json".to_string()),
                href: Some(format!("{}/users/{}", config.base_url, username)),
            }]),
        }
    }
}
