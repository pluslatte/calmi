use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::activitypub::properties::{AttributedTo, Content, Published, To};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Note extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Box<To>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<Content>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributed_to: Option<Box<AttributedTo>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub published: Option<Published>,
}
