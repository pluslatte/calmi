use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::activitypub::types::enums::ObjectBased;
use crate::activitypub::types::enums::ObjectOrString;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
/// Activity extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectBased>>,
}
