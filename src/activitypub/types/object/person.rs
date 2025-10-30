use serde::{Deserialize, Serialize};

use super::super::enums::ObjectOrString;
use super::super::object::ObjectBase;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person
/// Person extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    #[serde(flatten)]
    pub base: ObjectBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub inbox: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub outbox: Option<Box<ObjectOrString>>,
}
