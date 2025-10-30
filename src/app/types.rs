use serde::Deserialize;

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
