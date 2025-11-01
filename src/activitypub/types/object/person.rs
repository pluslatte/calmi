use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use super::super::enums::ObjectOrStringOrLink;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person
/// Person extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub inbox: Option<Box<ObjectOrStringOrLink>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub outbox: Option<Box<ObjectOrStringOrLink>>,
}
