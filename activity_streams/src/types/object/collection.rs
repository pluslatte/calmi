use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::TotalItems;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
/// Collection extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<TotalItems>,
}
