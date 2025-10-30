use serde::{Deserialize, Serialize};

use super::super::object::ObjectBase;
use super::super::enums::ObjectOrString;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
/// Create extends Activity
/// Activity extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectOrString>>,
}
