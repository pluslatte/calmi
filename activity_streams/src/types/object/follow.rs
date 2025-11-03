use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-follow
/// Follow extends Activity
/// Indicates that the actor is "following" the object.
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Follow {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<Actor>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectProperty>>,
}
