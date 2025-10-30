use serde::{Deserialize, Serialize};

use super::super::base::ObjectBase;
use super::super::enums::ObjectOrString;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
/// OrderedCollection extends Collection
/// Collection extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<usize>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<Vec<ObjectOrString>>,
}
