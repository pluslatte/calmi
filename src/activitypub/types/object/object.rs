use serde::{Deserialize, Serialize};

use super::super::base::ObjectBase;

/// https://www.w3.org/TR/activitystreams-core/#object
/// - All properties are optional
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    #[serde(flatten)]
    pub base: ObjectBase,
}
