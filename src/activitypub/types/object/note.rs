use serde::{Deserialize, Serialize};

use super::super::base::ObjectBase;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Note extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributed_to: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub published: Option<String>,
}
