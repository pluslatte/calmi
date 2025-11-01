use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
/// Collection extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
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
    pub total_items: Option<usize>,
}
