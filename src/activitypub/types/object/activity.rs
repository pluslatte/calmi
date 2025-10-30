use serde::{Deserialize, Serialize};

use super::super::object::ObjectBase;
use super::super::enums::ObjectExtended;
use super::super::enums::ObjectOrString;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
/// Activity extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectExtended>>,
}
