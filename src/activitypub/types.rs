use serde::{Deserialize, Serialize};

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<String>>,
    pub id: String,
    pub r#type: String,
    pub content: String,
    pub published: String,
    #[serde(rename = "attributedTo")]
    pub attributed_to: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cc: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateActivity {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<String>>,
    pub id: String,
    pub r#type: String,
    pub actor: String,
    pub published: String,
    pub to: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cc: Option<Vec<String>>,
    pub object: Note,
}

#[derive(Debug, Serialize)]
pub struct OutboxCollection {
    #[serde(rename = "@context")]
    pub context: String,
    pub id: String,
    pub r#type: String,
    #[serde(rename = "totalItems")]
    pub total_items: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub first: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last: Option<String>,
    #[serde(rename = "orderedItems", skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<Vec<CreateActivity>>,
}

#[derive(Debug, Deserialize)]
pub struct InboxActivity {
    #[serde(rename = "type")]
    pub activity_type: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteRequest {
    pub r#type: String,
    pub object: CreateNoteObject,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteObject {
    pub r#type: String,
    pub content: String,
    #[serde(default)]
    pub to: Vec<String>,
    #[serde(default)]
    pub cc: Vec<String>,
}

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
