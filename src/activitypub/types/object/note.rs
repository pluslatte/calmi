use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Note extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<String>>,

    /// https://www.w3.org/TR/activitypub/#obj-id
    /// ActivityPub specification requires `id` property
    /// `id` is a globally unique identifier for the object
    pub id: String,

    /// https://www.w3.org/TR/activitypub/#obj-id
    /// ActivityPub specification requires `type` property
    /// `type` indicates the type of the object
    #[serde(rename = "type")]
    pub r#type: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributed_to: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub published: Option<String>,
}
