use serde::{Deserialize, Serialize};

use super::super::enums::ObjectExtended;
use super::super::enums::ObjectOrString;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
/// Activity extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
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
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectExtended>>,
}
