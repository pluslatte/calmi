use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct WebFingerQuery {
    pub resource: String,
    #[serde(default)]
    pub rel: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct WebFingerResponse {
    pub subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aliases: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub properties: Option<HashMap<String, Option<String>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<Link>>,
}

#[derive(Debug, Serialize)]
pub struct Link {
    pub rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub titles: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub properties: Option<HashMap<String, Option<String>>>,
}

#[derive(Debug, Serialize)]
pub struct ActorObject {
    #[serde(rename = "@context")]
    pub context: Vec<String>,
    pub id: String,
    pub r#type: String,
    #[serde(rename = "preferredUsername")]
    pub preferred_username: String,
    pub name: String,
    pub summary: String,
    pub inbox: String,
    pub outbox: String,
}

#[derive(Debug, Deserialize)]
pub struct InboxActivity {
    #[serde(rename = "type")]
    #[allow(dead_code)]
    pub activity_type: String,
}

#[derive(Debug, Serialize)]
pub struct OutboxCollection {
    #[serde(rename = "@context")]
    pub context: String,
    pub id: String,
    pub r#type: String,
    #[serde(rename = "totalItems")]
    pub total_items: u32,
}
