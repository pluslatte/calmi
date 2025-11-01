pub mod activity;
pub mod collection;
pub mod create;
pub mod note;
pub mod ordered_collection;
pub mod person;

use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-core/#object
/// - All properties are optional
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {}
