use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use super::super::enums::ObjectOrString;
use super::OneOrMany;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
/// OrderedCollection extends Collection
/// Collection extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<usize>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<Vec<ObjectOrString>>,
}
