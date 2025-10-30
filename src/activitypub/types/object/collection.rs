use serde::{Deserialize, Serialize};

use super::super::object::ObjectBase;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
/// Collection extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<usize>,
}
