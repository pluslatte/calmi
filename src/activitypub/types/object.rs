pub mod activity;
pub mod collection;
pub mod create;
pub mod note;
pub mod ordered_collection;
pub mod person;

use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-core/#object
/// - All properties are optional
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    #[serde(flatten)]
    pub base: ObjectBase,
}

/// Common fields for all ActivityPub objects
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ObjectBase {
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
}
