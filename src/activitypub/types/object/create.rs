use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use super::super::enums::ObjectOrString;
use super::OneOrMany;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
/// Create extends Activity
/// Activity extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectOrString>>,
}
